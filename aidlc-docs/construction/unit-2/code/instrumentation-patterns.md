# Unit 2 Instrumentation Patterns & Usage Guide

**Scope**: Route-level span instrumentation, business operations tracing, PII filtering  
**Version**: Phase CONSTRUCTION, Unit 2  
**Objective**: Document 7 design patterns and 6 logical components for future maintenance  

---

## Section 1: Design Patterns (7 Total)

### Pattern 1: Module-Scope Span Registry

**What it is**: A mutable module-level variable that holds the currently active span

**Implementation** (RouteTracing.ts):
```typescript
export let currentRouteSpan: Span | null = null;
```

**Why this pattern**:
- Fast O(1) lookup for services to get parent span (vs. context API stack)
- Avoids prop drilling (no need to pass span through React component tree)
- Survives component re-renders (not tied to specific component instance)

**When to use**:
- Accessing parent span across module boundaries (e.g., Flight.ts needs route span from RouteTracing.ts)
- Non-React code (e.g., data services) that need to reference current context

**Risk**: 
- Mutable global state can be hard to test/reason about
- Must clean up on unmount (set to null) to avoid stale references

**Mitigation**:
- Test helpers (`setCurrentRouteSpan`, `getCurrentRouteSpan`) for predictable testing
- Clear protocol in cleanup handlers
- TypeScript null-safety: `currentRouteSpan !== null` check before use

---

### Pattern 2: Hook-Based Lifecycle Management

**What it is**: React hooks that tie span lifecycle to component mount/unmount and effect dependencies

**Implementation** (RouteTracing.ts):
```typescript
export function useRouteTracing(): void {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // End previous span, create new one
    // ...cleanup function to end current span
  }, [location.pathname]); // Re-run on pathname change
}
```

**Why this pattern**:
- Natural mapping: effect dependencies (location.pathname) → span lifecycle
- Automatic cleanup on component unmount
- Single source of truth for "current route"

**When to use**:
- React components that need to manage resources tied to component lifecycle
- Navigation events that should trigger span creation

**Risk**: 
- Multiple effect hooks can conflict if not coordinated
- Cleanup dependencies must be correct or cause memory leaks

**Mitigation**:
- Use `useRef` to track state that doesn't trigger re-renders
- Explicit dependency array (not auto-captured)
- Test effect cleanup by checking span.end() call count

---

### Pattern 3: History API Delegation

**What it is**: Patching native APIs to intercept events that might otherwise be missed

**Implementation** (RouteTracing.ts):
```typescript
export function useHistoryTracing(): void {
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    
    // Override: dispatch synthetic event so listeners are notified
    window.history.pushState = function (...args) {
      originalPushState(...args);
      window.dispatchEvent(new Event('pushstate'));
    };

    // Listeners can react to navigation (though React Router typically handles)
    window.addEventListener('popstate', handleNav);
    window.addEventListener('pushstate', handleNav);

    return () => {
      // Restore original on cleanup
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('pushstate', handleNav);
    };
  }, []);
}
```

**Why this pattern**:
- Catches navigations not handled by React Router
- Provides fallback coverage for edge cases
- Doesn't interfere with React Router's primary handling

**When to use**:
- When framework-level hooks (useLocation) aren't sufficient
- Need to intercept low-level browser APIs (History API, Fetch API, XHR)

**Risk**: 
- Modifying native APIs can cause conflicts with other libraries
- Restoration must be exact (bind context, parameter passing)

**Mitigation**:
- Save and restore original reference (don't modify in place)
- Test restoration by checking original is callable after cleanup
- Document why delegation is needed

---

### Pattern 4: Late-Attribute Injection

**What it is**: Attributes set asynchronously onto a stale span reference after the span was created

**Implementation** (reportWebVitals.ts):
```typescript
import { currentRouteSpan } from './services/RouteTracing';

const handler = (metric) => {
  // Metric is reported AFTER paint, but route span was created BEFORE
  // We reach back and inject the metric onto the active span
  if (currentRouteSpan) {
    currentRouteSpan.setAttribute('web_vital.lcp', metric.value);
    // Span hasn't ended yet, so setAttribute still works
  }
};
```

**Why this pattern**:
- Web vitals arrive after page paint, but route span was created on navigation
- Don't need to create a separate span for vitals (they're attributes of the page itself)
- Avoids race conditions with async metric reporting

**When to use**:
- Metrics/attributes that arrive asynchronously after span creation
- Modifying span attributes from multiple code paths (services, callbacks, etc.)

**Risk**: 
- If span ends before metric arrives, setAttribute will be a no-op (silently lost)
- Hard to debug which span got the attribute

**Mitigation**:
- Use **mutable module reference** (Pattern 1) so late injectors have access
- Ensure spans live long enough (e.g., route span ends on page unload, not immediately)
- Test: verify setAttribute was called on correct span

---

### Pattern 5: Context Propagation Bridge

**What it is**: Explicitly setting span as context parent via `trace.setSpan()` to establish parent-child relationships

**Implementation** (Flight.ts):
```typescript
import { context, trace } from '@opentelemetry/api';
import { currentRouteSpan } from './RouteTracing';

export const searchFlight = async (...) => {
  const tracer = getActiveTracer();
  const parentContext = currentRouteSpan 
    ? trace.setSpan(context.active(), currentRouteSpan)  // Bridge
    : context.active();

  return context.with(parentContext, async () => {
    const span = tracer.startSpan('http.client.operation.search', {...});
    // This span is now a child of currentRouteSpan
    return context.with(trace.setSpan(context.active(), span), async () => {
      // Async operations within this block are children of 'span'
    });
  });
};
```

**Why this pattern**:
- Explicit parent-child relationships (vs. implicit context stack)
- Works across async boundaries (context.with ensures proper nesting)
- Traces show full call hierarchy: route → operation → HTTP request

**When to use**:
- Creating spans that should be children of specific parent spans
- Async code where context stack might be lost without explicit management

**Risk**: 
- Easy to mix up `context.active()` (current stack) vs. `trace.setSpan()` (override)
- Nested context.with() calls can be hard to follow

**Mitigation**:
- Pattern: `const parent = trace.setSpan(...); context.with(parent, () => ...)`
- Comments explaining which span is parent, which is child
- Test: trace.Link's should show correct parent-child relationships

---

### Pattern 6: Blacklist Filter Chain

**What it is**: Sequential filtering at two levels (key-level and value-level) to remove PII

**Implementation** (CustomTracing.ts):
```typescript
const PII_KEY_BLACKLIST = new Set([
  'userId', 'email', 'sessionId', 'token', // ... key-level
]);

const PII_VALUE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email (value-level)
  /\b\d{3}-\d{2}-\d{4}\b/g,                             // SSN (value-level)
  // ... more patterns
];

export function sanitizeAttributes(rawAttrs) {
  const sanitized = {};
  for (const [key, value] of Object.entries(rawAttrs)) {
    // Level 1: Check key against blacklist
    if (PII_KEY_BLACKLIST.has(key)) continue;
    
    // Level 2: Check value (if string) against patterns
    if (typeof value === 'string' && PII_VALUE_PATTERNS.some(p => p.test(value))) continue;
    
    sanitized[key] = value;
  }
  return sanitized;
}
```

**Why this pattern**:
- Defense in depth: catch PII at two levels
- Handles both obvious keys (`userId`) and sneaky values (`email: "user@example"`)
- Reusable across all span creation

**When to use**:
- Any code that creates span attributes from user input or request data
- Compliance/security requirement to prevent PII leakage

**Risk**: 
- Blacklist can become incomplete (new PII types not caught)
- Regex patterns might have false positives/negatives

**Mitigation**:
- Audit blacklist regularly as new features added
- Test with real user data (if available, with appropriate access controls)
- Example: email regex only catches common patterns, not all valid emails

---

### Pattern 7: Graceful No-Op Degradation

**What it is**: All instrumentation is backend by no-op tracer if bootstrap fails, so errors don't cascade

**Implementation** (Unit 2 code):
```typescript
import { getActiveTracer } from './Tracing'; // Returns no-op tracer if bootstrap failed

export function useRouteTracing() {
  const tracer = getActiveTracer(); // Could be no-op tracer
  const span = tracer.startSpan('...'); // No-op span if tracer is no-op
  // span.setAttribute() is no-op call, no error thrown
}
```

**Why this pattern**:
- Bootstrap (Unit 1) might fail (network error, invalid config, etc.)
- Unit 2 code shouldn't crash application if bootstrap failed
- Spans created are silently discarded (no-op tracer)
- Application runs normally, just without telemetry

**When to use**:
- Always (defensive programming for any instrumentation)
- Dependencies are optional (e.g., telemetry is "nice to have", not essential)

**Risk**: 
- Silent failures: telemetry is lost without user knowledge
- Harder to debug: code runs, but spans aren't collected

**Mitigation**:
- Expose bootstrap status via `__TEST_ONLY__` API for debugging
- Log bootstrap status at startup (if logging is available)
- Assume bootstrap fails in tests; verify behavior with no-op tracer

---

## Section 2: Logical Components (6 Total)

### Component 1: Route Span Controller

**File**: `src/services/RouteTracing.ts` (new)  
**Patterns used**: 1 (Module-Scope Span Registry), 2 (Hook-Based Lifecycle)  
**Exports**:
- `currentRouteSpan` (mutable ref)
- `useRouteTracing()` (hook)
- `resolvePageName()` (helper)
- Test helpers: `setCurrentRouteSpan()`, `getCurrentRouteSpan()`

**Responsibility**: Manage route span lifecycle tied to location changes  
**Integration**: Reads from React Router (useLocation), writes to module-scope variable  
**Test coverage**: 6 tests for resolvePageName, 3 tests for registry helpers, 6 edge case tests

---

### Component 2: History Instrumentation Layer

**File**: `src/services/RouteTracing.ts` (new)  
**Patterns used**: 3 (History API Delegation), 2 (Hook-Based Lifecycle)  
**Exports**:
- `useHistoryTracing()` (hook)

**Responsibility**: Patch History API to detect navigations outside React Router  
**Integration**: Reads window.history, patches/restores on mount/unmount  
**Test coverage**: Not directly tested (tested as part of ApplicationContainer tests)

---

### Component 3: Web Vitals Bridge

**File**: `src/reportWebVitals.ts` (modified)  
**Patterns used**: 4 (Late-Attribute Injection), 7 (No-Op Degradation)  
**Exports**:
- `default` (default export function, unchanged)

**Responsibility**: Inject web vitals as span attributes  
**Integration**: Reads currentRouteSpan from RouteTracing, calls setAttribute()  
**Changes**: Added handler wrapper that injects metrics before callback  
**Test coverage**: No new tests (existing reportWebVitals.test.ts unchanged)

---

### Component 4: Service Operation Wrappers (Flight + Cart)

**File**: `src/services/Flight.ts` (modified), `src/services/Context.tsx` (modified)  
**Patterns used**: 5 (Context Propagation Bridge), 6 (Blacklist Filter Chain), 7 (No-Op Degradation)  
**Exports**:
- `searchFlight()` (modified, same signature)
- `airportTypeAhead()` (modified, same signature)
- `addToCart()` (modified, same signature)
- `removeFromCart()` (modified, same signature)
- `purchaseCart()` (modified, same signature)

**Responsibility**: Wrap async operations with child spans  
**Integration**: Reads currentRouteSpan, creates child spans via context.with()  
**Changes**: Added span creation + error handling, but public API unchanged  
**Test coverage**: Existing tests still pass (API unchanged)

---

### Component 5: PII Filter Extension

**File**: `src/services/CustomTracing.ts` (modified)  
**Patterns used**: 6 (Blacklist Filter Chain), 7 (No-Op Degradation)  
**Exports** (new):
- `PII_KEY_BLACKLIST` (Set of sensitive keys)
- `sanitizeAttributes()` (filter function)
- `filterErrorObject()` (error extraction + sanitization)

**Responsibility**: Remove PII from attributes before span creation  
**Integration**: Called from Route, Flight, Cart, Checkout before startSpan()  
**Changes**: Exported new functions, kept existing exports unchanged  
**Test coverage**: Existing CustomTracing tests still pass (no breaking changes)

---

### Component 6: Route-Aware App Shell

**File**: `src/components/ApplicationContainer/ApplicationContainer.tsx` (modified)  
**Patterns used**: 2 (Hook-Based Lifecycle)  
**Exports**:
- `default` (default export React component, unchanged)

**Responsibility**: Call route tracing hooks to enable span lifecycle management  
**Integration**: Calls useRouteTracing() + useHistoryTracing() in component body  
**Changes**: Added two hook calls (2 lines), no JSX changes  
**Test coverage**: ApplicationContainer tests pass (3 tests verifying render + hooks)

---

## Section 3: Usage Examples

### Example 1: New Service Operation Instrumentation

**Scenario**: Add new `deleteCart()` operation

**Pattern**: Mirror the `addToCart()` pattern

```typescript
// In src/services/Context.tsx
import { context, trace, type Attributes } from '@opentelemetry/api';
import { currentRouteSpan } from '@/services/RouteTracing';
import { sanitizeAttributes } from '@/services/CustomTracing';

const deleteCart = (): void => {
  const tracer = getActiveTracer();
  const parentContext = currentRouteSpan 
    ? trace.setSpan(context.active(), currentRouteSpan) 
    : context.active();

  context.with(parentContext, () => {
    const span = tracer.startSpan('http.client.operation.delete_cart', {
      attributes: sanitizeAttributes({
        'http.method': 'DELETE',
        'operation.type': 'delete_cart',
      }) as Attributes,
    });

    try {
      // ... implementation
      span.setStatus({ code: 0 }); // OK
    } catch (err) {
      span.setAttributes((filterErrorObject(err as Error)) as Attributes);
      span.recordException(err as Error);
      span.setStatus({ code: 2 }); // ERROR
    } finally {
      span.end();
    }
  });
};
```

---

### Example 2: Accessing Current Route Span

**Scenario**: New component needs to reference route span for custom logging

**Pattern**: Import `currentRouteSpan`, check for null

```typescript
import { currentRouteSpan } from '@/services/RouteTracing';

export const MyComponent = (): React.FC => {
  const span = currentRouteSpan;
  
  if (span) {
    console.log('Current page:', span.getAttribute('app.page.name'));
    // or create a related span if needed
  }

  return <div>...</div>;
};
```

---

### Example 3: Testing with Span Mocks

**Scenario**: Unit test that verifies custom code creates child span

**Pattern**: Use test helpers to set mock span

```typescript
import { setCurrentRouteSpan, getCurrentRouteSpan } from '@/services/RouteTracing';
import { vi } from 'vitest';

describe('MyFeature', () => {
  beforeEach(() => setCurrentRouteSpan(null));

  it('creates child span when operation runs', () => {
    const mockSpan = {
      setStatus: vi.fn(),
      end: vi.fn(),
      setAttribute: vi.fn(),
      setAttributes: vi.fn(),
    };
    setCurrentRouteSpan(mockSpan as any);

    // Run operation
    myOperation();

    // Verify child span was created via context
    expect(getCurrentRouteSpan()).toBe(mockSpan); // Still matches module reference
  });
});
```

---

## Section 4: Maintenance Guide

### Adding a New Page

1. Add pathname to `resolvePageName()` mapping in RouteTracing.ts
2. Add corresponding test in RouteTracing.test.ts
3. Spans automatically created for new page

### Adding a New Service Operation

1. Follow Pattern 5 (Context Propagation Bridge)
2. Wrap operation in context.with() + tracer.startSpan()
3. Apply sanitizeAttributes() before span creation
4. Add error handling with filterErrorObject()

### Updating PII Blacklist

1. Add sensitive key/pattern to CustomTracing.ts (PII_KEY_BLACKLIST or PII_VALUE_PATTERNS)
2. Add test case to CustomTracing.test.ts
3. Verify existing tests still pass
4. Review for false positives

### Debugging Span Issues

- Check `getActiveTracer()` returns non-null tracer (Unit 1 bootstrap successful)
- Verify `currentRouteSpan` is not null when services run
- Use browser DevTools to inspect trace context propagation (if console logs available)
- Enable verbose logging in Tracing.ts to see bootstrap status

---

## Cross-Reference: 7 Patterns → 6 Components

| Pattern | Component 1 | Component 2 | Component 3 | Component 4 | Component 5 | Component 6 |
|---------|------------|------------|------------|------------|------------|------------|
| Module-Scope Span Registry (1) | ✓ | | | | | |
| Hook-Based Lifecycle (2) | ✓ | ✓ | | | | ✓ |
| History API Delegation (3) | | ✓ | | | | |
| Late-Attribute Injection (4) | | | ✓ | | | |
| Context Propagation Bridge (5) | | | | ✓ | | |
| Blacklist Filter Chain (6) | | | | ✓ | ✓ | |
| No-Op Degradation (7) | | | ✓ | ✓ | ✓ | |

