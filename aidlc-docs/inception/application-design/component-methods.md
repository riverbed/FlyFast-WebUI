# Component Methods - OpenTelemetry Tracing Enhancement

## TracingBootstrapComponent Methods

1. initializeTracing(): TracingInitResult
- Input: none
- Output: { initialized: boolean; tracerName: string; reason?: string }
- Purpose: One-time setup of tracing provider and instrumentations.

2. getTracer(name?: string): Tracer
- Input: optional instrumentation/component tracer name
- Output: tracer instance
- Purpose: Centralized tracer retrieval.

3. isTracingInitialized(): boolean
- Input: none
- Output: initialization status
- Purpose: Guard duplicate initialization.

## CustomTracingComponent Methods

1. customTracing(name: string, operation: Promise<unknown>): Promise<unknown>
- Input: operation name and promise
- Output: operation resolution/rejection passthrough
- Purpose: Backward-compatible wrapper with span lifecycle management.

2. withSpan<T>(name: string, options: SpanOptions, fn: () => Promise<T>): Promise<T>
- Input: span name, optional attributes/kind metadata, async callback
- Output: callback result
- Purpose: Preferred new API for structured span wrapping.

3. addSpanEvent(name: string, attributes?: Attributes): void
- Input: event name and optional attributes
- Output: none
- Purpose: Add contextual events to active span.

## RouteTracingComponent Methods

1. startRouteTransition(routeFrom: string, routeTo: string): Span
- Input: previous and next route
- Output: navigation span
- Purpose: Start transition trace span.

2. completeRouteTransition(span: Span, status: "ok" | "error", details?: Attributes): void
- Input: span, completion status, optional details
- Output: none
- Purpose: Finalize route span and attach outcome metadata.

## WebVitalsTracingComponent Methods

1. registerWebVitalsTracing(): void
- Input: none
- Output: none
- Purpose: Attach web-vitals callback pipeline to tracing bridge.

2. reportWebVitalsToTracing(metric: WebVitalMetric): void
- Input: web-vitals metric callback payload
- Output: none
- Purpose: Convert metric into OTel event/span attributes.

## HttpCorrelationComponent Methods

1. configureHttpTracePropagation(): void
- Input: none
- Output: none
- Purpose: Ensure outbound requests carry trace context by policy.

2. annotateHttpSpan(span: Span, details: HttpSpanDetails): void
- Input: HTTP span and normalized request/response details
- Output: none
- Purpose: Apply consistent http and latency attributes.

## TracingTestSupportComponent Methods

1. createTracingMocks(): TracingMockBundle
- Input: none
- Output: reusable mock bundle
- Purpose: Build deterministic test scaffolding.

2. assertSpanLifecycle(testResult: unknown): void
- Input: test execution artifacts
- Output: none
- Purpose: Validate span start/end and status behavior.

3. assertPropagationHeaders(request: Request | string): void
- Input: request object or URL
- Output: none
- Purpose: Validate outbound trace context presence.
