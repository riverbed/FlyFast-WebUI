# Unit 1 ↔ Unit 2 Integration Guide

**Objective**: Document how Unit 2 builds on Unit 1 without breaking changes  
**Scope**: Route instrumentation, business operations, PII filtering, W3C propagation  
**Version**: Phase CONSTRUCTION, Units 1 & 2 complete  

---

## Architecture Overview

### High-Level Stack

```
┌─────────────────────────────────────────────────────────────┐
│                  BROWSER SPA (FlyFast-WebUI)                │
├─────────────────────────────────────────────────────────────┤
│ Instrumentation Layer (UNIT 2)                              │
│  ├─ Route Span Lifecycle (RouteTracing.ts)                  │
│  ├─ Business Operations (Flight.ts, Context.tsx)            │
│  ├─ Web Vitals Bridge (reportWebVitals.ts)                  │
│  └─ PII Filtering (CustomTracing.ts extensions)             │
├─────────────────────────────────────────────────────────────┤
│ Telemetry Bootstrap (UNIT 1)                                │
│  ├─ Tracer Provider Initialization (Tracing.ts)             │
│  ├─ Span Exporter (HTTP to OTLP collector)                  │
│  ├─ Instrumentation Plugins (Fetch, XHR, Document Load)    │
│  └─ Context Propagation (W3C TraceContext)                  │
├─────────────────────────────────────────────────────────────┤
│ OpenTelemetry SDKs (Dependencies)                           │
│  ├─ @opentelemetry/api (interfaces)                         │
│  ├─ @opentelemetry/sdk-trace-web (browser tracer)           │
│  ├─ @opentelemetry/sdk-trace-base (base SDK)                │
│  └─ @opentelemetry/exporter-trace-otlp-http (export)        │
├─────────────────────────────────────────────────────────────┤
│ Browser APIs & React                                        │
│  ├─ React Router (useLocation)                              │
│  ├─ History API (window.history)                            │
│  └─ Web Performance API (PerformanceObserver for vitals)    │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Graph

```
Unit 2 (Route Instrumentation)
├─ Imports from Unit 1 (Tracing.ts):
│  └─ getActiveTracer() → tracer for span creation
├─ Imports from CustomTracing (Unit 1):
│  └─ sanitizeAttributes() → PII filtering
├─ Reads ModuleScope from Unit 2:
│  └─ currentRouteSpan → parent span for services
└─ Integrates with React Router:
   └─ useLocation() → detect route changes

Services (Flight.ts, Context.tsx)
├─ Reads currentRouteSpan from Unit 2 (RouteTracing.ts)
├─ Creates child spans via getActiveTracer() from Unit 1
└─ Filter attributes via sanitizeAttributes() from Unit 1

Report Web Vitals (reportWebVitals.ts)
├─ Reads currentRouteSpan from Unit 2 (RouteTracing.ts)
└─ Injects metrics via span.setAttribute()

Unit 1 Instrumentation Plugins
├─ FetchInstrumentation: auto-instruments fetch() calls
│  ├─ Reads current span context
│  └─ Creates HTTP request span as child
└─ DocumentLoadInstrumentation: measures page load
   └─ Creates root span for initial page load

OTLP Exporter (Unit 1)
├─ Collects spans from tracer
├─ Groups into batches
└─ HTTP POST to OTLP collector endpoint
```

---

## Integration Points: Unit 1 ↔ Unit 2

### 1. Tracer Initialization

**Unit 1** (Tracing.ts):
- Initializes tracer provider
- Registers instrumentation plugins
- Exports `getActiveTracer()` for callers

**Unit 2** (RouteTracing.ts):
- Calls `getActiveTracer()` to get active tracer
- Creates route spans via `tracer.startSpan()`
- Falls back to no-op tracer if Unit 1 failed

**Contract**:
```typescript
// Unit 1 export
export function getActiveTracer(): Tracer {
  // Returns active tracer or no-op tracer
}

// Unit 2 usage
const tracer = getActiveTracer();
const span = tracer.startSpan('http.client.route', { attributes: {...} });
```

**Failure mode**: If Tracing.ts bootstrap fails, `getActiveTracer()` returns no-op tracer. All Unit 2 spans are no-op (silent failure, application continues).

---

### 2. PII Filtering

**Unit 1** (CustomTracing.ts v1):
- Exports `sanitizeErrorMessage()` (private helper)
- Exports `recordSafeError()` (public function)
- Exports `setAttributeSafe()` (public function)

**Unit 2** (CustomTracing.ts v2):
- Adds `PII_KEY_BLACKLIST` (Set of sensitive keys)
- Adds `sanitizeAttributes()` (filter raw attributes)
- Adds `filterErrorObject()` (extract + sanitize errors)
- No breaking changes to Unit 1 exports ✓

**Contract**:
```typescript
// Unit 2 adds new exports (Unit 1 unchanged)
export function sanitizeAttributes(raw: Record<string, unknown>): Record<string, unknown> {
  // Filter both by key (blacklist) and value (regex patterns)
}

export function filterErrorObject(error: unknown): Record<string, string> {
  // Extract error details and sanitize
}

// Unit 2 usage (Flight.ts, Context.tsx)
const safeAttrs = sanitizeAttributes(rawAttrs);
span.setAttributes(safeAttrs as Attributes);

const errorAttrs = filterErrorObject(err);
span.setAttributes(errorAttrs as Attributes);
```

**Failure mode**: Malformed attributes passed through (if sanitization fails). But this is defense-in-depth; errors are logged in span.recordException() anyway.

---

### 3. Context Propagation

**Unit 1** (Tracing.ts bootstrap):
- Registers `@opentelemetry/propagator-b3` (B3 headers)
- Registers W3C TraceContext propagator
- Auto-instrument Fetch to inject traceparent header

**Unit 2** (Flight.ts, Context.tsx):
- Create child spans via `context.with(trace.setSpan(...))`
- Child spans inherit context (parent span ID, trace ID)
- Fetch auto-instrumentation picks up context

**Contract**:
```typescript
// Unit 1: Fetch is auto-instrumented
// When fetch() fires, traceparent header is injected:
// traceparent: 00-{traceId}-{spanId}-01

// Unit 2: Service operations create spans
const parentContext = trace.setSpan(context.active(), currentRouteSpan);
context.with(parentContext, async () => {
  const span = tracer.startSpan('http.client.operation.search');
  // Fetch inside this context will include this span in traceparent header
  const response = await fetch(...); // traceparent includes current span
});
```

**Failure mode**: If context propagation fails, spans still exist but lack parent-child relationships. Traces show disconnected spans.

---

### 4. Span Export Pipeline

**Unit 1** (Tracing.ts):
- Tracer provider batches spans
- OTLP exporter sends to collector
- Collector endpoint URL from config

**Unit 2** (RouteTracing.ts, Flight.ts, Context.tsx):
- Create spans via tracer.startSpan()
- Span data flows through tracer → exporter → OTLP collector

**Contract**:
```typescript
// Unit 1: Exporter handles delivery
const exporter = new OTLPTraceExporter({
  url: 'http://otel-collector:4318/v1/traces', // or from config
});
tracerProvider.addSpanProcessor(new BatchSpanProcessor(exporter));

// Unit 2: Spans are automatically exported
const span = tracer.startSpan('...');
span.end(); // Span queued for export, eventually batched + sent
```

**Failure mode**: Network error or collector down → spans buffered in memory. Once limit exceeded, spans dropped. Application continues.

---

## Data Flow Example: Complete Flight Search

```
User navigates to /search
│
├─ React Router location.pathname change detected
├─ [ROOT SPAN ENDS: previous route]
│
└─ Unit 2: useRouteTracing() effect fires
   ├─ Calls getActiveTracer() [Unit 1]
   ├─ Creates http.client.route span with:
   │  ├─ http.route=/search
   │  ├─ app.page.name=SearchFlight (via resolvePageName)
   │  └─ app.route.from=/ (previous path)
   │  [All attributes filtered via sanitizeAttributes() before span creation]
   ├─ Stores in currentRouteSpan (module-scope variable)
   ├─ Span stored in tracer context
   └─ [ROUTE SPAN OPEN]

User enters destination "LAX" and clicks Search
│
└─ SearchFlight component calls Flight.searchFllight()
   │
   └─ Unit 2: Flight.searchFlight()
      ├─ Reads currentRouteSpan (from RouteTracing module)
      ├─ Creates parent context: trace.setSpan(context.active(), currentRouteSpan)
      ├─ Enters context.with(parentContext, async () => { ... })
      │
      └─ Calls tracer.startSpan('http.client.operation.search')
         ├─ Attributes:
         │  ├─ operation.type=flight_search
         │  ├─ search.from=JFK (sanitized)
         │  ├─ search.to=LAX (sanitized)
         │  [PII filtering via CustomTracing.sanitizeAttributes()]
         ├─ Span is child of currentRouteSpan (via context.with)
         ├─ [OPERATION SPAN OPEN]
         │
         └─ Calls fetch('/flightsearchapi/searchflight?...')
            │
            └─ Unit 1: FetchInstrumentation auto-fires
               ├─ Reads current span context (operation.search span)
               ├─ Creates HTTP request span as grandchild
               ├─ Injects traceparent header into fetch request:
               │  └─ traceparent: 00-{traceId}-{searchOpSpanId}-01
               ├─ [HTTP REQUEST SPAN OPEN]
               │
               └─ Request reaches backend
                  └─ Backend can read traceparent header
                     └─ Link logs/backend spans to same trace

[Search results returned, operation completes]
│
└─ Unit 2: Flight.searchFlight() finally block
   ├─ operation.search span ended
   ├─ span.setStatus({ code: 0 }) [OK]
   ├─ span.end()
   └─ [OPERATION SPAN CLOSED]

[LCP metric reported by browser]
│
└─ Unit 2: reportWebVitals callback fires
   ├─ Reads currentRouteSpan
   ├─ Calls currentRouteSpan.setAttribute('web_vital.lcp', 2500)
   │  [Attribute injected onto OPEN route span]
   └─ [ROUTE SPAN NOW HAS LCP ATTRIBUTE]

User navigates to /checkout (clicks "Book")
│
└─ React Router location.pathname change detected
├─ Unit 1: Unit 1 may create nav span (if DocumentLoadInstrumentation active)
├─ Unit 2: useRouteTracing() effect fires again
│  ├─ Previous /search route span ended
│  │  ├─ Final attributes: web_vital.lcp, web_vital.fcp, etc.
│  │  ├─ span.setStatus({ code: 0 })
│  │  ├─ span.end()
│  │  └─ [/search ROUTE SPAN CLOSED, QUEUED FOR EXPORT]
│  │
│  └─ New http.client.route /checkout span created
│     ├─ app.route.from=/search
│     ├─ app.route.to=/checkout
│     ├─ [/checkout ROUTE SPAN OPEN]
│
└─ Tracer buffers spans
   ├─ /search route span (with all children + web vitals)
   ├─ search operation span (child of /search)
   ├─ HTTP request span (child of search operation)
   └─ [BATCH ACCUMULATES]

[Batch timeout or limit reached]
│
└─ Unit 1: OTLP exporter fires
   ├─ Collects buffered spans
   ├─ Groups by trace ID
   ├─ HTTP POST to OTLP collector:
   │  └─ Body: { resourceSpans: [ { ... } ] }
   └─ [SPANS NOW VISIBLE IN OBSERVABILITY BACKENDS]

[Session ends or user navigates away]
│
└─ Unit 2: ApplicationContainer component unmounts
   ├─ useRouteTracing cleanup: final span ended
   ├─ useHistoryTracing cleanup: window.history.pushState restored
   ├─ All spans flushed to exporter
   └─ [SESSION COMPLETE]
```

---

## No Breaking Changes

### Unit 1 Public API (Unchanged)

```typescript
// Tracing.ts exports (v1.0 → v1.0, no changes)
export function Tracing(...): Result;
export function getActiveTracer(): Tracer;
export const __TEST_ONLY__: {...};

// CustomTracing.ts exports (v1.0 → v1.1, backward compatible)
export async function customTracing<T>(name: string, operation: Promise<T>): Promise<T>;
export const TracingHelpers = {...};
export function recordSafeError(...): void;
export function setAttributeSafe(...): void; // unchanged
// NEW EXPORTS (additive, no breaking changes):
// export function sanitizeAttributes(...): Record<string, unknown>;
// export function filterErrorObject(...): Record<string, string>;
// export const PII_KEY_BLACKLIST: ReadonlySet<string>;
```

### Service Public APIs (Unchanged)

```typescript
// Flight.ts (v1.0 → v1.1, backward compatible)
export async function searchFlight(...): Promise<TripResult[][]>; // signature unchanged
export async function airportTypeAhead(...): Promise<Airport[]>; // signature unchanged

// Context.tsx (v1.0 → v1.1, backward compatible)
export interface CartContextValue {
  addToCart(flights: FlightSegment[]): void; // signature unchanged
  removeFromCart(index: number): void; // signature unchanged
  purchaseCart(): void; // signature unchanged
  // ...
}
```

### ApplicationContainer Public API (Unchanged)

```typescript
// ApplicationContainer.tsx (v1.0 → v1.1, backward compatible)
export default ApplicationContainer; // Same component
// Internal: added useRouteTracing() + useHistoryTracing() calls
// External: no change to component signature or props
```

### Why No Breaking Changes?

1. **New modules** (RouteTracing.ts) don't affect existing code
2. **Extended exports** (CustomTracing.ts) additive only; legacy exports preserved
3. **Service implementations** wrap existing logic; signatures unchanged
4. **Internal refactoring** in components (add hook calls) has zero impact on callers

---

## Deployment Checklist

### Pre-Deployment

- [ ] All 7 patterns documented and understood by team
- [ ] All 6 components reviewed for correctness
- [ ] TypeScript strict mode passes (0 errors)
- [ ] Production build succeeds (468.60 KB JS)
- [ ] All tests pass (18 Unit 2 tests, all others unchanged)
- [ ] Manual integration verification complete (dev server runs)

### Deployment

- [ ] Deploy with Unit 1 + Unit 2 together (no sequential rollouts)
- [ ] Monitor OTLP collector for trace ingestion
- [ ] Verify traces show full parent-child hierarchy (route → operation → HTTP request)
- [ ] Check for PII in observed traces (should be none)
- [ ] Correlation logs with traces using trace IDs

### Post-Deployment

- [ ] Observe span drop rate (should be < 1% for normal traffic)
- [ ] Verify web vitals are present as span attributes
- [ ] Spot-check for correct parent-child relationships
- [ ] Monitor span export latency (< 5s typical)
- [ ] Set up alerts for exporter failures

---

## Troubleshooting

### Issue: No spans visible in OTLP collector

**Diagnostics**:
1. Check `getActiveTracer()` returns non-no-op tracer
   ```typescript
   const tracer = getActiveTracer();
   console.log(tracer.constructor.name); // Should NOT be "NoopTracer"
   ```

2. Check network tab: verify OTLP POST requests to `/v1/traces` endpoint

3. Check browser console for errors during span creation

**Solution**:
- If using no-op tracer: Tracing.ts bootstrap failed; check config, network, collector endpoint
- If network errors: Check CORS headers, collector availability, network connectivity

### Issue: Parent-child relationships missing (spans are siblings)

**Diagnostics**:
1. Verify `currentRouteSpan` is set: `console.log(currentRouteSpan)`
2. Verify `context.with()` is being called: Add debug statements in Flight.ts, Context.tsx
3. Check trace IDs: route span and operation span should have same trace ID

**Solution**:
- Add explicit `trace.setSpan()` before operation (see Pattern 5 example)
- Verify `context.active()` returns correct context
- Check no other code is overwriting context

### Issue: PII appears in traces

**Diagnostics**:
1. Check which span has PII: User ID, email, phone, JWT token, etc.
2. Find where span was created: Use grep for span name

**Solution**:
- Add key to `PII_KEY_BLACKLIST` in CustomTracing.ts
- Or add regex to `PII_VALUE_PATTERNS` if value-level filtering needed
- Re-deploy and verify PII is filtered in new traces

### Issue: Web vitals not appearing as span attributes

**Diagnostics**:
1. Check browser console: Are LCP/FCP metrics being reported?
   ```javascript
   // In reportWebVitals.ts, add console.log to handler
   console.log('Web vital:', metric.name, metric.value);
   ```

2. Check `currentRouteSpan` is not null when metrics arrive
3. Look at span attributes: Should have `web_vital.lcp`, etc.

**Solution**:
- Verify reportWebVitals.ts handler is being called
- Verify route span is still open (not ended) when metrics arrive
- Check metric name matches mapping in `webVitalAttributeMap`

---

## Performance Characteristics

| Operation | Typical Duration | Notes |
|-----------|------------------|-------|
| Route span creation | < 1ms | On every navigation |
| Service operation span creation | < 1ms | During flight search, cart ops, etc. |
| HTTP request span (auto-instrumented) | < 1ms | FetchInstrumentation overhead |
| Attribute injection (late-inject web vitals) | < 1ms | Post-render, non-blocking |
| Span export (HTTP POST) | 10-100ms | Async, batched every 5s or 512 spans |
| Total instrumentation overhead | < 50ms per page load | Negligible for typical SPA |

**Memory Overhead**:
- Module-scope variable `currentRouteSpan`: 1 Span object reference (~100 bytes)
- Span objects in memory (unbatched): ~1KB each, auto-garbage-collected after export
- Tracer context stack: negligible (<1KB)

---

## Future Enhancements (Post-Unit 2)

1. **Unit 3: Error Instrumentation** (planned)
   - Capture JavaScript errors (with PII filtering)
   - Correlation with spans

2. **Unit 4: Client-side Profiling** (future)
   - CPU profile sampling
   - Memory profiling
   - Linked to trace context

3. **Observability UI**: Trace viewer for FlyFast spans
   - Timeline visualization
   - Error drill-down
   - Latency analysis

---

