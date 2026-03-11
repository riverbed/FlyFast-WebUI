# Unit 1 Tech Stack Decisions - Tracing Core Modernization

## Decision Summary
Unit 1 keeps the current OpenTelemetry package family and modernizes usage patterns through lifecycle control and compatibility-safe wrapper improvements.

## Technology Decisions

### TD-1: Tracing Provider Lifecycle Strategy
Decision:
- Use a singleton/idempotent initialization strategy for web tracer provider setup.

Rationale:
- Prevent duplicate instrumentation and inconsistent context behavior.
- Improve reliability under strict mode and hot reload execution.

### TD-2: Context Management Strategy
Decision:
- Continue zone/context management compatible with current frontend runtime and OTel stack.

Rationale:
- Preserve async context continuity while avoiding breaking runtime changes in Unit 1.

### TD-3: Export and Processor Strategy
Decision:
- Retain OTLP HTTP exporter path and environment-sensitive processor strategy.
- Keep production-appropriate batching and development visibility behavior.

Rationale:
- Align with existing observability pipeline and deployment assumptions.
- Avoid introducing infrastructure coupling changes in Unit 1.

### TD-4: Custom Tracing Compatibility Strategy
Decision:
- Preserve existing customTracing(name, promise) call behavior.
- Introduce enhanced helper APIs in a backward-compatible way.

Rationale:
- Minimize migration risk and avoid immediate callsite churn.

### TD-5: Error Semantics Strategy
Decision:
- Standardize wrapper error handling to set error status, record safe diagnostics, and always close span lifecycle.

Rationale:
- Improve observability quality and reduce partial-span artifacts.

### TD-6: Data Hygiene Strategy
Decision:
- Apply strict attribute/event hygiene to prevent sensitive data emission.

Rationale:
- Enforce privacy requirement and keep telemetry safe for downstream systems.

### TD-7: Testing Strategy
Decision:
- Extend existing vitest unit coverage around tracing bootstrap idempotency and wrapper error/success behavior.

Rationale:
- Protect Unit 1 invariants before expanding instrumentation scope in Unit 2.

## Operational Constraints
- No backend API contract changes required in Unit 1.
- No infrastructure topology changes required in Unit 1.
- Unit 1 must provide stable tracing foundations for Unit 2 route/vitals/business instrumentation.

## Risk and Mitigation
1. Risk: Duplicate initialization under repeated startup paths.
Mitigation: Explicit initialization guard and reused provider state.

2. Risk: Wrapper regressions break legacy usage.
Mitigation: Compatibility-preserving API behavior with focused unit tests.

3. Risk: Overly verbose or sensitive diagnostics.
Mitigation: Sanitized diagnostics and constrained attribute set.

## Stage Exit Criteria
- NFR requirements are complete and approved.
- Tech decisions are documented and aligned with Unit 1 boundaries.
- Inputs ready for Unit 1 NFR Design stage.
