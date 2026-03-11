# Unit of Work Dependency Matrix - OpenTelemetry Tracing Enhancement

## Execution Mode
Sequential execution is required.

Unit 1 -> Unit 2 -> Unit 3

## Dependency Graph
- Unit 1 provides foundational tracing APIs and initialization behavior.
- Unit 2 depends on Unit 1 to avoid duplicate provider setup and API churn.
- Unit 3 depends on Unit 2 to validate final behavior and avoid invalid test expectations.

## Handoff Gates

### Unit 1 -> Unit 2
- Tracing bootstrap is idempotent.
- Custom tracing helper is backward compatible.
- Existing tracing tests continue to pass.

### Unit 2 -> Unit 3
- Route/web-vitals/business instrumentation paths are active.
- Span naming and attribute schema are stable.
- PII exclusion policy is implemented.

### Unit 3 -> Construction Build and Test
- Unit/integration tracing tests pass.
- Type-check and build remain successful.
- No regressions in existing application behavior.

## Change Priority by Unit
- Unit 1: Critical
- Unit 2: Critical
- Unit 3: Important

## Risk Summary
- Medium overall risk due to cross-cutting runtime instrumentation.
- Mitigation: strict sequencing, compatibility-first API updates, and comprehensive tests.
