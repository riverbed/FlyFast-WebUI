# Unit of Work Definitions - OpenTelemetry Tracing Enhancement

## Overview
Three units execute sequentially. Each unit must pass its gate before the next begins.

## Unit 1 - Tracing Core Modernization
Purpose:
- Modernize tracing bootstrap and provider lifecycle.
- Ensure idempotent initialization and stable tracer access APIs.
- Enhance custom tracing helper while preserving backward compatibility.

Scope:
- src/services/Tracing.ts
- src/services/CustomTracing.ts
- src/index.tsx (bootstrap integration point)

Deliverables:
- Singleton-safe tracing initialization
- Stable tracer accessor patterns
- Enhanced custom tracing wrappers (existing calls still valid)

Success Criteria:
- Tracing initializes once per runtime lifecycle
- Existing custom tracing usages continue to work
- Baseline tracing tests pass

Handoff to Unit 2:
- Shared tracer/provider APIs are stable
- Backward-compatible helper contracts are in place

## Unit 2 - Instrumentation Expansion
Purpose:
- Expand telemetry coverage for route transitions, web vitals, and business operations.
- Strengthen UI->backend->UI correlation visibility.

Scope:
- Route transition hooks/effects and related files
- reportWebVitals integration path
- Service-level business spans (flight/search/checkout interactions)

Deliverables:
- Route transition span model
- Web-vitals-to-trace bridge
- Business operation spans with delay/error event coverage
- Comprehensive attributes excluding PII

Success Criteria:
- Route transitions emit spans with route metadata
- Web-vitals metrics are emitted into OTel pipeline
- Service operations emit parent/child span relationships
- No sensitive identifiers or PII in emitted attributes

Handoff to Unit 3:
- New instrumentation paths are active
- Trace data shape is stable for validation

## Unit 3 - Validation and Hardening
Purpose:
- Validate correctness, resilience, and regression safety of tracing changes.

Scope:
- src/services/__tests__/Tracing.test.ts
- src/services/__tests__/CustomTracing.test.ts
- src/index.test.tsx and related integration checks
- Additional assertions for propagation and error status behavior

Deliverables:
- Extended automated test coverage for tracing
- Verified propagation and span lifecycle behavior
- Reliability guardrails for failure scenarios

Success Criteria:
- Tracing-related tests pass in CI
- Propagation behavior validated for backend-bound requests
- No app flow regressions caused by tracing
- Build and test commands remain green
