# OpenTelemetry Tracing Improvement - Verification Questions

Please answer the following questions to clarify requirements for the OpenTelemetry tracing enhancement project.

---

## Question 1: Security Extension Enforcement
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
E) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2: Tracing Scope - Page Navigation Tracking
Should we implement React Router instrumentation to track page navigation events and route changes?

A) Yes — auto-instrument all React Router events (page transitions, lazy loading, suspense, route parameters)
B) Yes — but only track successful navigations, not failures or suspense states
C) Yes — but limited to main routes only (Home, SearchFlight, Checkout), skip nested routes
D) No — focus on request/response tracing only, not page navigation
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 3: Tracing Scope - Web Vitals Integration
Should we integrate Web Vitals metrics (LCP, FID, CLS, TTFB) into OpenTelemetry?

A) Yes — capture all Web Vitals metrics as OTel gauges and report to OTLP endpoint
B) Yes — but only Core Web Vitals (LCP, FID, CLS), skip TTFB
C) Yes — but as standalone metrics, not integrated into trace context
D) No — keep Web Vitals separate from tracing, only log to console/analytics
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4: Tracing Scope - Business Operation Spans
Should we create custom spans for business operations (flight search, checkout flow, booking confirmation)?

A) Yes — auto-instrument all services (Flight.ts, Context.tsx) and component methods with business spans
B) Yes — but only for async operations (API calls, promise-based workflows)
C) Yes — but only for top-level page components (SearchFlight, Checkout), not nested components
D) Manual only — provide utilities/helpers but don't auto-instrument, let developers add spans
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: End-to-End Trace Correlation
For end-to-end tracing (UI → Backend → UI), how should trace context be propagated?

A) Automatic propagation — inject trace headers (traceparent or b3) into ALL HTTP requests automatically
B) Automatic with allowlist — auto-inject into configured backend endpoints only
C) Manual with helper — provide utility function for developers to explicitly set trace headers
D) No specific propagation — rely on existing instrumentation (Fetch/XHR) and backend correlation
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6: Span Attributes Detail Level
What level of contextual information should we capture in span attributes?

A) Comprehensive — capture all available: URL, query params, user ID, device info, timing, HTTP status, response size, error details
B) Detailed — capture URL, method, status, duration, response size, but NOT PII or query params
C) Minimal — capture method, URL path (no params), status, and duration only
D) Current level — keep existing attributes (HTTP basics), add Web Vitals metrics only
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7: Error and Exception Handling in Traces
How should errors and exceptions be handled in tracing?

A) Comprehensive — capture stack traces, error messages, and context for all errors and exceptions
B) Context only — log error type and context, but skip stack traces to reduce payload size
C) OTLP only — send error details only when ERROR span status is set, not as separate events
D) Current approach — extend existing error handling (console logs + spans), add error context
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: Performance Targets for Tracing Overhead
What are the acceptable performance targets for tracing instrumentation overhead?

A) Strict — < 50ms added to page load time, < 10ms per request latency impact
B) Moderate — < 100ms page load overhead, < 20ms per request impact (acceptable for observability)
C) Lenient — < 200ms page load overhead (negligible user impact at this level)
D) No specific target — optimize intelligently, add instrumentation freely
E) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 9: Backward Compatibility with CustomTracing
The existing CustomTracing.ts provides a manual span wrapper utility. Should we:

A) Replace it completely — re-instrument all usages with hooks/utilities, deprecate the old helper
B) Keep it alongside new utilities — support both old and new approaches during transition
C) Enhance it — extend CustomTracing with new capabilities (correlation IDs, automatic context)
D) Ignore it — focus on auto-instrumentation, leave manual wrapper as-is
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 10: Sampling Strategy
Should tracing be sampled to reduce OTLP endpoint load?

A) No sampling (trace all requests) — full fidelity observability for development and testing
B) Probabilistic sampling — sample a percentage (e.g., 10-50%) of traces in production
C) Head sampling — sample at the browser level before sending to backend
D) Adaptive sampling — sample more during errors/slow transactions, fewer during normal operations
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 11: Testing and Validation
How should tracing instrumentation be tested and validated?

A) Comprehensive — add unit tests for span creation, end-to-end tests for trace flow, mock OTLP endpoint
B) Integration tests only — test actual trace flow to backend endpoint, mock is insufficient
C) Manual validation — provide test utilities and screenshots/docs, no automated tests
D) Minimal — no formal tests, rely on visual inspection and production monitoring
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 12: Documentation and Team Enablement
What level of documentation should we provide for the new tracing instrumentation?

A) Comprehensive — architecture guide, instrumentation patterns reference, troubleshooting guide, examples
B) Practical — quick-start guide with code examples for common scenarios (custom spans, debugging)
C) Inline only — JSDoc comments and inline code comments, no separate documentation
D) Minimal — update README with brief overview, rely on code clarity
E) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Submission Instructions

1. **Please fill in all [Answer]: fields** with your chosen option letter (A, B, C, D, or E)
2. **If you choose "E) Other"**, briefly describe your custom response on the same line
3. **Save this file** and let me know when complete
4. **Feel free to ask clarifying questions** about any of these questions before answering

Once you provide all answers, I'll analyze them for completeness and generate a comprehensive OpenTelemetry tracing improvement plan.
