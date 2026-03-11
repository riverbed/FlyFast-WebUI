# Components - OpenTelemetry Tracing Enhancement

## 1. TracingBootstrapComponent
Purpose: Initialize and expose a singleton web tracer provider and tracer access APIs.

Responsibilities:
- Initialize exporter, processors, and context manager once.
- Register automatic instrumentations.
- Provide stable accessors for tracer/provider state.
- Prevent duplicate registration during hot reload or strict-mode rerenders.

Interfaces:
- initializeTracing(): TracingInitResult
- getTracer(name?: string): Tracer
- isTracingInitialized(): boolean

## 2. CustomTracingComponent
Purpose: Provide manual tracing helpers for business operations with backward compatibility.

Responsibilities:
- Wrap async operations with spans.
- Add operation attributes/events.
- Capture errors and set span status correctly.
- Preserve existing customTracing call compatibility.

Interfaces:
- customTracing(name: string, operation: Promise<unknown>): Promise<unknown>
- withSpan<T>(name: string, options: SpanOptions, fn: () => Promise<T>): Promise<T>
- addSpanEvent(name: string, attributes?: Attributes): void

## 3. RouteTracingComponent
Purpose: Capture route transition telemetry for all navigations.

Responsibilities:
- Start span on route transition start.
- End/annotate span on transition completion/failure.
- Emit route context attributes (from/to, pathname, transition type).

Interfaces:
- startRouteTransition(routeFrom: string, routeTo: string): Span
- completeRouteTransition(span: Span, status: "ok" | "error", details?: Attributes): void

## 4. WebVitalsTracingComponent
Purpose: Convert web-vitals events into OTel events/spans linked to active context.

Responsibilities:
- Receive web-vitals callbacks.
- Emit normalized OTel telemetry records.
- Preserve existing reportWebVitals runtime behavior.

Interfaces:
- reportWebVitalsToTracing(metric: WebVitalMetric): void
- registerWebVitalsTracing(): void

## 5. HttpCorrelationComponent
Purpose: Ensure UI-request spans correlate with backend response-related telemetry.

Responsibilities:
- Configure outbound propagation behavior for fetch/XHR.
- Standardize HTTP span attributes/events.
- Associate business spans with network operation timing.

Interfaces:
- configureHttpTracePropagation(): void
- annotateHttpSpan(span: Span, details: HttpSpanDetails): void

## 6. TracingTestSupportComponent
Purpose: Provide deterministic test seams for tracing behavior validation.

Responsibilities:
- Mock/spy tracing initialization and helper behavior.
- Verify propagation, span lifecycle, and error paths.
- Keep tests aligned with existing vitest structure.

Interfaces:
- createTracingMocks(): TracingMockBundle
- assertSpanLifecycle(...): void
- assertPropagationHeaders(...): void
