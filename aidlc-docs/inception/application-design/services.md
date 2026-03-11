# Services - OpenTelemetry Tracing Enhancement

## Service Layer Overview
The enhancement uses a focused observability service layer under the existing services area.

## 1. TracingInitializationService
Responsibilities:
- Own tracing bootstrap lifecycle.
- Register instrumentations and context management once.
- Expose application-wide tracer/provider references.

Orchestration:
- Called from app entry boot path.
- Invokes HTTP correlation setup and optional vitals bridge registration.

## 2. BusinessTracingService
Responsibilities:
- Provide business-operation tracing wrappers.
- Add operation metadata/events for search and checkout flows.
- Standardize error instrumentation for async failures.

Orchestration:
- Used by flight service calls and major page/interaction flows.
- Delegates tracer access to TracingInitializationService.

## 3. RouteTracingService
Responsibilities:
- Track route transition spans and route-level telemetry.
- Emit transition state events and timing.

Orchestration:
- Triggered by routing lifecycle hooks/effects.
- Sends spans through initialized tracer pipeline.

## 4. WebVitalsBridgeService
Responsibilities:
- Bridge web-vitals callback data to tracing events/spans.
- Normalize metric payload and include route/runtime context.

Orchestration:
- Hooked into existing reportWebVitals invocation path.
- Uses BusinessTracingService/TracingInitializationService APIs.

## 5. TraceErrorService
Responsibilities:
- Centralize exception-to-span conversion logic.
- Apply status/error metadata consistently.
- Redact sensitive fields before telemetry emission.

Orchestration:
- Used by BusinessTracingService and RouteTracingService on failure paths.

## Service Interaction Pattern
1. Application starts -> TracingInitializationService initializes once.
2. Route transitions -> RouteTracingService emits transition spans.
3. User actions/API calls -> BusinessTracingService wraps operations.
4. Web-vitals callback -> WebVitalsBridgeService emits telemetry with active context.
5. Failures anywhere -> TraceErrorService records standardized error metadata.
