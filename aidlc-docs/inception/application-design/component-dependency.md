# Component Dependency - OpenTelemetry Tracing Enhancement

## Dependency Matrix

| Source Component | Depends On | Dependency Type | Priority | Reason |
|---|---|---|---|---|
| TracingBootstrapComponent | OpenTelemetry SDK/Exporter/Instrumentations | External runtime | Critical | Core tracing initialization |
| CustomTracingComponent | TracingBootstrapComponent | Internal service | Critical | Acquire tracer and context |
| RouteTracingComponent | TracingBootstrapComponent | Internal service | Critical | Create route spans with shared provider |
| WebVitalsTracingComponent | TracingBootstrapComponent | Internal service | Critical | Emit metrics through same trace pipeline |
| HttpCorrelationComponent | TracingBootstrapComponent | Internal service | Critical | Shared propagation configuration |
| BusinessTracingService | CustomTracingComponent, TraceErrorService | Internal orchestration | Critical | Business span lifecycle and error metadata |
| RouteTracingService | RouteTracingComponent, TraceErrorService | Internal orchestration | Important | Route-level telemetry consistency |
| WebVitalsBridgeService | WebVitalsTracingComponent, BusinessTracingService | Internal orchestration | Important | Metric conversion and contextual correlation |
| TraceErrorService | None (utility-level) | Internal utility | Important | Standardized error capture |
| TracingTestSupportComponent | All tracing components/services | Test dependency | Important | Validation and regression confidence |

## Communication Patterns
- Bootstrap pattern: one-time initialization at app startup.
- Pull pattern: components/services request tracer from centralized access API.
- Wrapper pattern: business operations wrapped by tracing helper APIs.
- Event pattern: route/vitals/error events attached to active spans.

## Data Flow (Text)
1. index bootstrap initializes tracing provider and instrumentations.
2. Route changes emit navigation spans with route attributes.
3. Business operations start child spans, then trigger network requests.
4. Fetch/XHR instrumentation injects trace context headers for backend correlation.
5. Response outcomes and delays are attached to active spans.
6. Errors are standardized and attached to span status/events.
7. Exporter sends spans to OTLP endpoint.

## Change Priority
- Critical: Tracing bootstrap, custom tracing compatibility, request correlation.
- Important: Route tracing, vitals bridge, error standardization.
- Optional: Additional helper ergonomics beyond required compatibility.
