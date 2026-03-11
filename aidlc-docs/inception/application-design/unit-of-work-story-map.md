# Unit of Work Story Map - OpenTelemetry Tracing Enhancement

## Requirement to Unit Mapping

| Requirement | Description | Primary Unit | Secondary Unit |
|---|---|---|---|
| FR-1 | Unified tracing bootstrap | Unit 1 | Unit 3 |
| FR-2 | Route navigation tracing | Unit 2 | Unit 3 |
| FR-3 | Web vitals to tracing | Unit 2 | Unit 3 |
| FR-4 | Business operation spans | Unit 2 | Unit 3 |
| FR-5 | End-to-end trace continuity | Unit 2 | Unit 3 |
| FR-6 | Enhanced error tracing | Unit 1 | Unit 2 |
| FR-7 | Backward-compatible custom API | Unit 1 | Unit 3 |
| FR-8 | Trace validation coverage | Unit 3 | Unit 2 |
| NFR-1 | Privacy / no PII | Unit 2 | Unit 3 |
| NFR-2 | Performance overhead control | Unit 2 | Unit 3 |
| NFR-3 | Reliability and graceful failures | Unit 1 | Unit 3 |
| NFR-4 | Maintainability | Unit 1 | Unit 2 |
| NFR-5 | Observability quality consistency | Unit 2 | Unit 3 |

## File-Level Workstream Mapping

### Unit 1
- src/services/Tracing.ts
- src/services/CustomTracing.ts
- src/index.tsx

### Unit 2
- src/reportWebVitals.ts
- src/App.tsx and/or route lifecycle integration points
- src/services/Flight.ts and relevant service interaction points
- additional instrumentation helpers under src/services/

### Unit 3
- src/services/__tests__/Tracing.test.ts
- src/services/__tests__/CustomTracing.test.ts
- src/index.test.tsx
- any added tracing-specific test files

## Completion Gates
- Unit 1 complete: stable, idempotent bootstrap + backward compatibility verified.
- Unit 2 complete: expanded instrumentation active and privacy constraints enforced.
- Unit 3 complete: automated validation and regression hardening complete.
