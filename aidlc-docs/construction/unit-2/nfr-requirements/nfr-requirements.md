# NFR Requirements - Unit 2: Route-Level Instrumentation

**Unit**: Unit 2 - Route-Level Span Instrumentation & Business Operations Tracing
**Phase**: CONSTRUCTION
**Stage**: NFR Requirements
**Date Generated**: 2026-03-11
**Depends On**: Unit 1 (Tracing core bootstrap  Tracing.ts, CustomTracing.ts)

---

## Executive Summary

Unit 2 expands telemetry coverage by adding route transition spans, web vitals attribute capture, and service-level business operation spans across the flight search, cart, and checkout flows. All new spans follow OTel HTTP-style naming conventions, propagate W3C TraceContext headers to all outbound requests, and apply blacklist-based PII filtering before recording any attributes or error data. 100% of route transitions are sampled, and service operation spans are children of their triggering route span.

---

## NFR Requirements by Category

### 1. Span Naming & OTel Semantic Conventions

**Requirement**: All instrumented spans must follow HTTP-style OTel semantic naming.

**Rationale**: Q1=A  HTTP-style naming (`http.client.route`, `http.client.page`) ensures consistency with the OpenTelemetry specification and compatibility with OTel-aware backends (Jaeger, Tempo, Honeycomb, etc.).

**Naming Standards**:

| Instrumentation Point | Span Name |
|---|---|
| Route transition (React Router change) | `http.client.route` |
| Page render complete | `http.client.page.render` |
| History API navigation | `http.client.navigate` |
| Flight search operation | `http.client.operation.search` |
| Cart add/remove operation | `http.client.operation.cart` |
| Checkout submit operation | `http.client.operation.checkout` |
| Web vitals collection | Attributes on parent route span (not a separate span) |

**Attribute Naming Standards**:
- Route attributes: `http.route`, `http.url.path`, `http.method` (GET for navigations)
- Custom attributes: `app.route.from`, `app.route.to`, `app.page.name`
- Service attributes: `app.operation.name`, `app.operation.status`, `app.operation.duration_ms`
- Error attributes: `error.type`, `error.message` (sanitized), `http.response.status_code`

**Success Criteria**:
- All spans in OTel backend display with `http.client.*` prefix
- No custom naming schemas or inconsistent prefixes
- Attribute keys follow OTel semantic conventions where applicable

---

### 2. Performance & Tracing Overhead

**Requirement**: No explicit overhead budget; optimize only if users report degraded performance.

**Rationale**: Q2=D  The application is a browser SPA; tracing infrastructure is asynchronous and non-blocking. Aggressive upfront constraints would over-engineer the instrumentation unnecessarily.

**Design Guidelines** (without hard budget):
- All span operations (start/end/setAttribute) must be non-blocking and synchronous in the hot path
- Span export (network) always uses `BatchSpanProcessor` (already set in Unit 1 production config) to decouple export from user interactions
- Route hooks must complete their instrumentation logic synchronously before yielding to React rendering
- Web vitals are recorded reactively via the existing `reportWebVitals` callback  no active polling
- Memory: No accumulation of unbounded span buffers; BatchSpanProcessor flush interval controlled by Unit 1 configuration

**Monitoring Strategy**:
- If users report slowness after Unit 2, compare Lighthouse/CrUX metrics before and after deployment
- Browser DevTools Performance tab is primary diagnostic tool  trace spans must not create layout shifts or long tasks

**Success Criteria**:
- Production build passes without new performance lint warnings
- No measurable change in Lighthouse scores post-deployment (regression gate)
- Span lifecycle operations complete before next React render cycle

---

### 3. Web Vitals Integration

**Requirement**: Web vitals metrics (LCP, FCP, CLS, FID, TTFB) are recorded as attributes on the page transition span, not as separate spans.

**Rationale**: Q3=B  Embedding vitals as attributes on the route span keeps the trace compact, avoids a separate metrics pipeline, and allows correlation of page performance with specific navigations.

**Integration Approach**:
- The existing `reportWebVitals.ts` callback is the integration point
- Each vital is translated to an OTel span attribute on the **most recent active route span**
- Vitals arrive asynchronously after the route span may have ended; use a late-attribute injection pattern or record on a stale span reference held in module scope
- Attribute mapping:

| Web Vital | Span Attribute Key | Unit |
|---|---|---|
| LCP (Largest Contentful Paint) | `web_vital.lcp` | milliseconds |
| FCP (First Contentful Paint) | `web_vital.fcp` | milliseconds |
| CLS (Cumulative Layout Shift) | `web_vital.cls` | score (unitless float) |
| FID (First Input Delay) | `web_vital.fid` | milliseconds |
| TTFB (Time to First Byte) | `web_vital.ttfb` | milliseconds |
| INP (Interaction to Next Paint) | `web_vital.inp` | milliseconds |

**Success Criteria**:
- All 6 vitals appear as attributes on the root/initial route span
- Vital attributes visible in OTel backend alongside route metadata
- No separate span created for web vitals
- Vitals arrive to the span via the `reportWebVitals` callback without blocking rendering

---

### 4. Error Capture & Data Safety

**Requirement**: Capture the full error object for service operation failures, then apply blacklist filtering before recording any attributes.

**Rationale**: Q4=A (clarified) + Q5=B  Full context is valuable for debugging, but PII must be removed before attributes are set on spans. The blacklist filter (from Q5=B and Unit 1 sanitization logic) applies uniformly to both route attributes and serialized error objects.

**Error Capture Process**:
1. Catch exception / non-2xx response in service operation wrapper
2. Extract: `error.name`, `error.message`, `error.stack` (first 3 frames only), HTTP status code
3. Serialize to flat attribute map: `{ "error.type": name, "error.message": msg, "http.status": code }`
4. Apply blacklist filter to all keys and values (see PII Blacklist below)
5. Set filtered attributes on the span, then mark span status as `ERROR`

**PII Blacklist (applied to both route attributes and error data)**:

| Category | Blacklisted Keys | Pattern-based scrub |
|---|---|---|
| User identity | `userId`, `user_id`, `username`, `sessionId`, `session_id` |  |
| Booking references | `bookingRef`, `booking_ref`, `confirmationCode`, `pnr` |  |
| Payment | `cardNumber`, `cvv`, `paymentToken`, `accountNumber` |  |
| Contact | `email`, `phone`, `phoneNumber`, `address` | Email regex, phone regex |
| Authentication | `token`, `authToken`, `accessToken`, `jwt`, `password` | Bearer/JWT regex |

**Value-level sanitization** (applied after key blacklist):
- Email pattern: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`  `[email]`
- Phone pattern: `(\+?[\d\s\-()]{10,15})`  `[phone]`
- JWT/Bearer pattern: `(Bearer\s+[A-Za-z0-9-._~+/]+=*)`  `[token]`

**Success Criteria**:
- No PII keys or values appear in exported span attributes
- Error spans contain actionable technical detail (name, status code, sanitized message)
- Error capture does not rethrow or alter the original error flow

---

### 5. Trace Context Propagation

**Requirement**: W3C TraceContext headers (`traceparent`, `tracestate`) are sent to all outbound HTTP requests.

**Rationale**: Q6=A  Full propagation to all outbound requests ensures end-to-end trace correlation between frontend and backend services regardless of origin. This maximises observability value.

**Implementation**:
- Propagation is already handled by `FetchInstrumentation` and `XMLHttpRequestInstrumentation` auto-instrumentations configured in Unit 1 (`Tracing.ts`)
- Unit 2 does **not** need to manually inject headers  auto-instrumentation handles this at the `window.fetch` and `XMLHttpRequest` level
- Verify that `propagateTraceHeaderCorsUrls` is set to `/.*/` (all URLs) in the instrumentation config

**Cross-Origin Handling**:
- The W3C TraceContext `traceparent` header is a safe, standardized header
- CORS preflight will include this header if backend allows `Access-Control-Allow-Headers: traceparent`
- If CORS blocks the header, the span is still created locally  propagation failure is non-fatal

**Success Criteria**:
- `traceparent` header visible in browser DevTools Network tab for all fetch/XHR requests
- Backend traces (where supported) show parent-child relationship with frontend spans
- No CORS errors introduced by header injection

---

### 6. Sampling Strategy

**Requirement**: 100% of route transitions and service operations are sampled.

**Rationale**: Q7=A  Full sampling provides complete observability coverage. For a browser SPA with relatively low per-user event frequency, 100% sampling is appropriate and avoids missing intermittent errors or edge-case traces.

**Sampler Configuration**:
- `AlwaysOnSampler` (default in Unit 1's `WebTracerProvider` setup)
- No additional sampler configuration needed for Unit 2
- All spans created by Unit 2 instrumentation will be exported

**Success Criteria**:
- Every route transition visible in OTel backend
- Every service operation span visible in trace view
- No sampling gaps in user journey traces

---

### 7. Span Hierarchy & Bootstrap Relationship

**Requirement**: Route transition spans are independent root spans  not children of the bootstrap span.

**Rationale**: Q8=A  Each page navigation starts its own trace context, keeping the bootstrap trace clean and avoiding inflating a single trace with all subsequent user activity.

**Hierarchy Model**:

`
[Bootstrap Span]  (Unit 1  ends after init, standalone trace)

[Route Span: http.client.route /home]   <- independent root span
     [Service Op: http.client.operation.search]   <- child (Q10=A)
         [Fetch: GET /api/flights]   <- auto-instrumented child

[Route Span: http.client.route /checkout]   <- new root span on navigation
     [Service Op: http.client.operation.checkout]
         [Fetch: POST /api/bookings]
`

**Implementation Notes**:
- Each React Router location change creates a new root span (no parent context injected)
- Service operation spans use `tracer.startSpan(name, { parent: routeSpan })` to establish parent-child
- Bootstrap span (Unit 1) does not need modification

**Success Criteria**:
- OTel backend shows each navigation as a separate trace
- Service operations appear nested under their triggering route trace
- Bootstrap trace is a clean, isolated single-span trace

---

### 8. Navigation Coverage

**Requirement**: All navigations including History API calls are traced, not just React Router changes.

**Rationale**: Q9=A  Full History API coverage ensures no navigations are invisible, even from third-party libraries or direct programmatic use.

**Coverage Scope**:
- React Router `useLocation` changes  captured via `useEffect` in route hook
- `window.history.pushState` / `replaceState`  captured via listener override
- `popstate` event (browser back/forward)  captured via `window.addEventListener('popstate', ...)`
- `@opentelemetry/instrumentation-user-interaction` (Unit 1) already captures click-driven navigations

**Success Criteria**:
- Programmatic `router.navigate(...)`  span created
- Browser back/forward button  span created
- `history.pushState()` called directly  span created
- No duplicate spans for the same navigation event

---

### 9. Service Operation Span Parenting

**Requirement**: Service operation spans (search, cart, checkout) are children of the active route span.

**Rationale**: Q10=A  Parent-child relationship connects user intent (navigating to a page) with the backend operations triggered from that page, enabling full waterfall traces.

**Parenting Mechanism**:
- The active route span is exported from module state: `export let currentRouteSpan: Span | null = null`
- Service wrappers pass `currentRouteSpan` as parent when starting child spans
- Child spans end when the operation completes; the parent route span ends on next navigation
- If no route span is active, service operations create root spans as fallback

**Success Criteria**:
- Flight search span appears nested under the SearchFlight route span
- Cart operation span appears nested under the current page route span
- Checkout span appears nested under the Checkout route span
- Standalone operations (no active route span) create root spans without error

---

### 10. Unit 1 Integration Contract

**Requirement**: Unit 2 uses Unit 1 APIs exclusively  no re-initialization of tracing bootstrap.

**Integration Contract**:
- Import `getActiveTracer` from `src/services/Tracing.ts`  never call `Tracing()` in Unit 2
- Import `TracingHelpers` from `src/services/CustomTracing.ts` for span operations
- If `getActiveTracer()` returns a no-op tracer (bootstrap failed), all Unit 2 spans degrade to no-ops silently
- No modifications to `Tracing.ts` or `CustomTracing.ts` in Unit 2

**Success Criteria**:
- Unit 1 test suite remains green after Unit 2 changes
- No second call to `Tracing()` anywhere in Unit 2 code
- Graceful degradation: bootstrap failure  Unit 2 spans silently no-op

---

## Quality Gates

| Gate | Criteria | Tool |
|---|---|---|
| Build | No compile errors | `npm run build` |
| Type-check | 0 strict TypeScript errors | `npm run type-check` |
| Unit tests | All existing tests pass | `npm test -- --run` |
| No PII in spans | Blacklist attributes absent from exported attributes | Assertions in test suite |
| Route spans created | Span created per navigation | Browser DevTools / OTel backend |
| Parent-child visible | Service ops nested under route spans | OTel backend waterfall view |

---

**Document Version**: 1.0
**Created**: 2026-03-11
