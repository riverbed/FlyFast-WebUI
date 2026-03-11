# NFR Design Patterns - Unit 2: Route-Level Instrumentation

**Unit**: Unit 2 - Route-Level Span Instrumentation & Business Operations Tracing
**Phase**: CONSTRUCTION
**Stage**: NFR Design
**Date Generated**: 2026-03-11

---

## Overview

Seven design patterns translate the NFR requirements into concrete architectural decisions for Unit 2. Each pattern addresses a specific quality attribute identified in the NFR requirements.

---

## Pattern 1: Module-Scope Span Registry

**Quality Attribute**: Span parent-child correlation (NFR 9)
**Problem**: React component hierarchy and service modules need shared access to the current active route span without prop-drilling or React Context overhead.
**Solution**: Export a mutable module-level variable from `RouteTracing.ts` that stores the active route span. Any module that imports from `RouteTracing.ts` gets a stable reference that is updated whenever the route changes.

`
RouteTracing.ts
 export let currentRouteSpan: Span | null = null
 setCurrentRouteSpan(span)  called by useRouteTracing hook
 clearCurrentRouteSpan()  called on cleanup / unmount
`

**Tradeoffs**:
- Pro: Zero React overhead, accessible from service modules without React context
- Pro: Works in both component and non-component code paths
- Con: Module-scope mutation is not React Concurrent Mode-safe for rendering decisions  acceptable here since span state is not used to drive rendering

**Degradation**: If `currentRouteSpan` is null (no active route), service operations fall back to creating root spans independently.

---

## Pattern 2: Hook-Based Span Lifecycle Management

**Quality Attribute**: Correctness, no span leaks (NFR 8 / 10)
**Problem**: Route spans must start when a navigation occurs and end when the next navigation begins. React's lifecycle must drive this, not manual cleanup.
**Solution**: A `useRouteTracing()` hook uses `useEffect` with `location.pathname` as its dependency. The effect creates a new root span on each location change and returns a cleanup function that ends the previous span cleanly.

`
useRouteTracing()
 useEffect([location.pathname])
    End previous span (if exists) with OK status
    Create new root span with http.client.route attributes
    Update currentRouteSpan registry
    Return cleanup: end span + clear registry
`

**Span boundary rules**:
- Span starts: synchronously in useEffect body
- Span ends: on next navigation (previous span cleanup) or component unmount
- If component unmounts without navigation, span ends with OK status

---

## Pattern 3: History API Delegation

**Quality Attribute**: Complete navigation coverage (NFR 8)
**Problem**: React Router's `useLocation` only fires for navigations managed via the Router. Direct `history.pushState()` calls and browser back/forward buttons are invisible to it.
**Solution**: A `useHistoryTracing()` hook (called once in `ApplicationContainer`) patches `window.history.pushState` to dispatch a synthetic `pushstate` event, and listens for `popstate`. React Router's own navigation will also trigger `useLocation`, so `useRouteTracing` handles the span creation  `useHistoryTracing` just ensures non-Router navigations reach the Router's event loop cleanly.

`
useHistoryTracing()  runs once on mount
 Save original window.history.pushState
 Override pushState: call original + dispatch 'pushstate' event
 addEventListener('popstate', handler)
 addEventListener('pushstate', handler)
 Cleanup: restore original pushState, removeEventListeners
`

**De-duplication**: `useRouteTracing` is the authoritative span creator. `useHistoryTracing` only extends coverage to non-Router navigations  it does not create spans itself, avoiding duplicate spans for the same event.

---

## Pattern 4: Late-Attribute Injection

**Quality Attribute**: Web vitals correlation with route spans (NFR 3)
**Problem**: Web vitals (LCP, FCP, CLS, etc.) are emitted by the browser asynchronously, often after the route span's `useEffect` has already fired the span start. Some vitals (LCP, CLS) may arrive seconds after navigation.
**Solution**: The `reportWebVitals` callback receives each vital and injects it as an attribute on `currentRouteSpan`  the module-scope ref exported from `RouteTracing.ts`. Because `currentRouteSpan` holds a reference to the actual OTel Span object (not a copy), setting attributes after the span was started is valid in the OTel SDK as long as the span has not been ended.

`
reportWebVitals callback
 For each metric:
     Look up currentRouteSpan (module import)
     If span exists and not ended: span.setAttribute(web_vital.{name}, value)
     If span does not exist: discard (no-op)
`

**Span end timing**: `useRouteTracing` ends the previous span when a new navigation begins. If a vital arrives between navigations, it is recorded on the current span before it ends. If it arrives after a span ends, it is silently discarded.

---

## Pattern 5: Context Propagation Bridge

**Quality Attribute**: Parent-child span hierarchy for service operations (NFR 9)
**Problem**: Service functions (`searchFlights`, cart updates, checkout) are called from React components but run in plain module scope, disconnected from React's rendering context. They cannot access React state or hooks.
**Solution**: Service functions import `currentRouteSpan` from `RouteTracing.ts` and use the OTel `context` API to create a context object that carries the route span as the active span, then execute the operation inside that context:

`
Service function (e.g. searchFlights)
 Import currentRouteSpan from RouteTracing
 Build parent context:
    If currentRouteSpan exists: context.with(trace.setSpan(context.active(), currentRouteSpan), fn)
    If null: context.active() (no parent  creates root span as fallback)
 Call TracingHelpers.withSpan(name, callback) inside parent context
 Child span is automatically child of currentRouteSpan in OTel backend
`

**No changes to TracingHelpers API**: The bridge uses the OTel context API directly (`context.with`) before calling the existing `TracingHelpers.withSpan`  no modification to `CustomTracing.ts` API surface needed for this pattern.

---

## Pattern 6: Blacklist Filter Chain

**Quality Attribute**: PII protection across all span attributes (NFR 4 / 5)
**Problem**: Both route attributes and serialized error objects can contain PII. A single, shared filter function must be applied consistently at the point of `span.setAttribute()` calls.
**Solution**: Extend the existing `recordSafeError` / `setAttributeSafe` functions in `CustomTracing.ts` with a dedicated `sanitizeAttributes` function that applies the full PII key blacklist and value-level regex scrubbing.

`
sanitizeAttributes(raw: Record<string, unknown>): Record<string, string>
 For each [key, value]:
    If key in PII_KEY_BLACKLIST  skip entry
    Convert value to string
    Apply value regex scrub (email, phone, JWT patterns)
 Return filtered flat map

Usage points:
 Route span attributes (in useRouteTracing hook)
 Service operation attributes (in Flight.ts, Context.tsx wrappers)
 Error object serialization (in filterErrorObject helper)
`

**Single source of truth**: The blacklist set and all regex patterns live in one location (`CustomTracing.ts`). All Unit 2 instrumentation consumes this shared filter  no duplicated sanitization logic.

---

## Pattern 7: Graceful No-Op Degradation

**Quality Attribute**: Resilience  tracing must never break the application (NFR 10 / Unit 1 contract)
**Problem**: If Unit 1 bootstrap failed (network issue, config error, etc.), `getActiveTracer()` returns a no-op tracer whose methods do nothing. All Unit 2 instrumentation must behave correctly in this case.
**Solution**: No special handling needed in Unit 2. The OTel no-op tracer returns no-op spans whose attribute/status/end methods are all safe no-ops. The `currentRouteSpan` will be a no-op span, `context.with()` works normally, and all service operations proceed unchanged.

`
Degradation chain:
 Unit 1: getActiveTracer() returns NoOpTracer (bootstrap failed)
 useRouteTracing: startSpan() returns no-op Span object
 currentRouteSpan = <no-op Span>
 Service wrappers: context.with() + TracingHelpers.withSpan()  all no-ops
 Result: application functions normally, no spans exported, no errors thrown
`

**Test seam**: The `__TEST_ONLY__` namespace from Unit 1 (`resetTracingState()`) allows tests to simulate bootstrap failure and verify Unit 2 instrumentation degrades cleanly.

---

## Pattern Interaction Diagram

`
Browser Navigation Event
        
        
useHistoryTracing (Pattern 3)
  Ensures pushState / popstate reach React Router
        
        
useRouteTracing (Pattern 2)  location.pathname change
   End previous span
   Start new root span (Pattern 1: module registry updated)
   Attributes filtered through Blacklist Filter Chain (Pattern 6)
        
        
                                          
reportWebVitals callback          Service function call
(Pattern 4: late injection)       (Pattern 5: context bridge)
Sets web_vital.* attributes       Starts child span under currentRouteSpan
on currentRouteSpan               Attributes filtered (Pattern 6)
                                  Degrades to no-op if tracer failed (Pattern 7)
`

---

**Document Version**: 1.0
**Created**: 2026-03-11
