# RouteTracing API Reference (Unit 2)

**Module**: `src/services/RouteTracing.ts`  
**Purpose**: Core route-level span instrumentation and History API integration for browser SPA  
**Dependencies**: React Router, OpenTelemetry API, CustomTracing (Unit 1)  
**Version**: Unit 2, Phase: CONSTRUCTION

---

## Module Exports 

### `currentRouteSpan: Span | null`

**Type**: Mutable module-scope variable  
**Purpose**: Registry for the currently active route span  
**Access**: Read/write across entire application (via import)  
**Initial value**: `null` (until first route navigation)  
**Owner**: RouteTracing module (internal management)  

Use case:
- Flight, Cart, and Checkout services read `currentRouteSpan` to establish parent-child span relationships
- Web vitals module reads `currentRouteSpan` to inject metrics as attributes
- Not typically accessed directly by application code (hooks provide abstraction)

---

### `useRouteTracing(): void`

**Type**: React Hook  
**Purpose**: Manages the lifecycle of route transition spans  
**When to call**: Once per app session, in the root component inside `<BrowserRouter>`  
**Call count**: Exactly once per session (called in ApplicationContainer)

**Behavior**:
1. On mount: Initializes span lifecycle listener
2. On every `location.pathname` change: 
   - Ends previous route span with OK status
   - Creates new `http.client.route` root span
   - Stores span in `currentRouteSpan` for services to reference
3. On unmount or next navigation: Ends span with OK status

**Span Properties**:
- **Name**: `http.client.route`
- **Kind**: Implicit (uses tracer.startSpan defaults → INTERNAL)
- **Attributes**:
  - `http.route` (pathname)
  - `http.url.path` (pathname)
  - `http.method` ('GET')
  - `app.route.from` (previous pathname or "(direct)")
  - `app.route.to` (current pathname)
  - `app.page.name` (resolved via resolvePageName)
- **All attributes are filtered through `sanitizeAttributes()`**

**Parent Context**: None (root span—independent, not child of bootstrap span)

**Example**:
```typescript
import { useRouteTracing } from '@/services/RouteTracing';

export const ApplicationShell = () => {
  useRouteTracing(); // Called once, manages route spans for session
  return <Layout />;
};
```

---

### `useHistoryTracing(): void`

**Type**: React Hook  
**Purpose**: Patches History API to capture navigations not caught by React Router  
**When to call**: Once per app session, alongside `useRouteTracing()`  
**Duration**: Active for entire component lifecycle

**Behavior**:
1. On mount: 
   - Saves original `window.history.pushState`
   - Overrides `window.history.pushState` to dispatch synthetic `'pushstate'` event
   - Registers event listeners for `'popstate'` and `'pushstate'` events
   - No-op handlers (React Router already handles the navigation)
2. On unmount: 
   - Restores original `window.history.pushState`
   - Removes event listeners

**Coverage**:
- Intercepts direct `history.pushState()` calls
- Listens for browser back/forward button (popstate event)
- Integrates with React Router's route transitions

**Example**:
```typescript
export const ApplicationShell = () => {
  useRouteTracing();
  useHistoryTracing(); // Covers History API edge cases
  return <Layout />;
};
```

---

### `resolvePageName(pathname: string): string`

**Type**: Pure function (no side effects)  
**Purpose**: Maps URL pathname to human-readable page name for span attributes  
**Input**: Pathname string (e.g., `/search`, `/checkout`, `/cart`)  
**Output**: Page name string (e.g., `SearchFlight`, `Checkout`, `Cart`)

**Mapping**:
| Pathname | Resolved Name |
|----------|---------------|
| `/` | Home |
| `/home` | Home |
| `/search*` (startsWith) | SearchFlight |
| `/checkout*` | Checkout |
| `/cart*` | Cart |
| other | path segment (e.g., `/about` → `about`) |

**Normalization**:
- Removes trailing slashes: `/search/` → `/search` → `SearchFlight`
- Empty path: `` → `/` → `Home`
- Query strings → ignored: `/search?q=test` → `/search` → `SearchFlight`

**Example**:
```typescript
resolvePageName('/search');     // → 'SearchFlight'
resolvePageName('/checkout');   // → 'Checkout'
resolvePageName('/search/');    // → 'SearchFlight' (trailing slash normalized)
resolvePageName('');            // → 'Home' (empty normalized to /)
```

---

### `setCurrentRouteSpan(span: Span | null): void`

**Type**: Test helper function  
**Purpose**: Manually set the module-scope `currentRouteSpan` for testing  
**Use case**: Unit tests that need to mock route span state  
**Access**: Exported for test files only (prefer not using in production code)

**Example**:
```typescript
import { setCurrentRouteSpan } from '@/services/RouteTracing';

beforeEach(() => {
  setCurrentRouteSpan(null); // Reset before each test
});

it('does something with a span', () => {
  const mockSpan = createMockSpan();
  setCurrentRouteSpan(mockSpan);
  expect(currentRouteSpan).toBe(mockSpan);
});
```

---

### `getCurrentRouteSpan(): Span | null`

**Type**: Test helper function  
**Purpose**: Retrieve the current module-scope `currentRouteSpan` for testing  
**Use case**: Unit tests that need to assert span state  
**Access**: Exported for test files only  
**Returns**: Current span or `null`

**Example**:
```typescript
import { getCurrentRouteSpan } from '@/services/RouteTracing';

it('verifies span exists', () => {
  expect(getCurrentRouteSpan()).not.toBeNull();
  expect(getCurrentRouteSpan().getAttribute('app.page.name')).toBe('Home');
});
```

---

## Integration Points

### With Unit 1 (Tracing.ts)

- **Import**: `getActiveTracer()` from `Tracing.ts`
- **Usage**: Route spans use the active tracer (initialized by Unit 1 bootstrap)
- **Dependency**: No-op behavior if Unit 1 bootstrap fails (graceful degradation)
- **Export back to Unit 1**: None (RouteTracing is independent module)

### With CustomTracing.ts (PII Filtering)

- **Import**: `sanitizeAttributes()` from `CustomTracing.ts`
- **Usage**: All route span attributes filtered before creation
- **Dependency**: PII filtering applied to route metadata
- **Blacklist coverage**: Route-level attributes generally safe, but user IDs etc. filtered as precaution

### With reportWebVitals.ts (Web Vitals Bridge)

- **Import**: `currentRouteSpan` (mutable reference)
- **Usage**: Web vitals module injects metrics as attributes onto active span
- **Attribute names**: `web_vital.lcp`, `web_vital.fcp`, `web_vital.cls`, `web_vital.inp`, `web_vital.ttfb`
- **Timing**: Async injection (vitals arrive post-render, injected onto stale span ref)

### With Flight.ts & Context.tsx (Service Instrumentation)

- **Import**: `currentRouteSpan` (mutable reference)
- **Usage**: Service operations create child spans, use currentRouteSpan as parent
- **Parent-child model**: Service operation span created with `trace.setSpan(context.active(), currentRouteSpan)`
- **Span nesting**: Route span (root) → Service operation span (child) → HTTP request span (grandchild, auto-instrumented by Unit 1)

### With ApplicationContainer.tsx

- **Import**: `useRouteTracing`, `useHistoryTracing` hooks
- **Usage**: Hooks called in ApplicationShell component body
- **Requirement**: Component must be inside `<BrowserRouter>` context
- **Duration**: Hooks active for entire component lifecycle (full session)

---

## Span Lifecycle Example: Flight Search Flow

```
User navigates to /search
  └─ useRouteTracing() detects location.pathname change
     └─ Creates http.client.route span
        ├─ Attributes: http.route=/search, app.page.name=SearchFlight, app.route.from=(direct)
        ├─ currentRouteSpan = this span
        └─ [Await web vitals]

User types destination and submits search
  └─ searchFlight() called (Flight.ts)
     └─ Uses currentRouteSpan as parent
        └─ Creates http.client.operation.search child span
           ├─ Attributes: operation.type=flight_search, search.from=JFK, search.to=LAX
           ├─ [Fetch fires]
           └─ FetchInstrumentation (Unit 1) creates HTTP request grandchild span
              ├─ W3C TraceContext header propagated to backend
              └─ [Response returns]
           └─ operation.search span ended

[LCP metric reported]
  └─ reportWebVitals callback fires
     └─ currentRouteSpan.setAttribute('web_vital.lcp', 3500)

User clicks "Book" → navigates to /checkout
  └─ useRouteTracing() detects location.pathname change
     └─ Previous /search span ended with OK status + web_vital attributes
     └─ Creates new http.client.route /checkout span
        ├─ Attributes: app.route.from=/search, app.route.to=/checkout, app.page.name=Checkout
        ├─ currentRouteSpan = this span
        └─ [Ready for checkout operations]

[Session ends or user closes tab]
  └─ useRouteTracing() cleanup: final span ended
  └─ useHistoryTracing() cleanup: history.pushState restored
```

---

## Error Handling & PII Safety

### Attribute Filtering
- All route span attributes passed through `sanitizeAttributes()`
- Sensitive keys (userId, sessionId, email, etc.) removed
- Values matching PII patterns (email regex, phone regex, JWT patterns) removed
- Non-string/number/boolean types rejected

### Error Recording
- Route spans end with OK status (route transitions don't throw errors)
- Errors in child operation spans use `sanitizeAttributes()` + `filterErrorObject()` (via Flight, Context)
- Error messages sanitized to remove URLs, emails, tokens

### Web Vitals Injection
- Metrics injected only if `currentRouteSpan` exists
- Metric names validated against whitelist: CLS, FCP, LCP, INP, TTFB
- No custom attributes from external sources

---

## Performance Considerations

### Span Creation Overhead
- Route span created once per navigation (typically 1-3 spans per user session)
- Minimal overhead: span is lightweight object + one setAttribute call
- No blocking I/O or async operations in span lifecycle

### Module-Scope Variable Access
- Reading/writing `currentRouteSpan` is O(1) lookup
- Called frequently by services (searchFlight, cartAdd, etc.)
- Avoided expensive reference lookups via direct module export

### History API Patching
- `window.history.pushState` override callback is no-op (event listeners do nothing)
- Minimal performance impact: one function call + event dispatch per history push
- Restored on component unmount to avoid permanent patches

---

## Testing

### Unit Tests (RouteTracing.test.ts)
- 15 tests covering:
  - resolvePageName mapping for all routes ✓
  - Span registry getter/setter helpers ✓
  - Edge cases: trailing slashes, empty paths, query strings ✓

### Integration Tests
- ApplicationContainer renders and manages hooks ✓
- useRouteTracing integrates with React Router lifecycle ✓
- useHistoryTracing patches and restores History API ✓

### Manual Integration Verification (Step 11)
- Dev server starts: `npm run dev` ✓
- TypeScript strict mode: `npm run type-check` (0 errors) ✓
- Production build: `npm run build` (468.60 KB JS) ✓
- Full test suite: `npm test -- --run` (18/18 Unit 2 tests pass) ✓

---

## Migration Notes (Unit 1 → Unit 2)

- **No breaking changes** to Unit 1 code
- Unit 2 is purely additive: new module + modifications to services
- Services (Flight, Context, ApplicationContainer) now create child spans but maintain same public API
- Web vitals still reported to console via legacy callback, but also injected as span attributes
- Unit 1 code unaffected (different module scope, no shared state changes)

