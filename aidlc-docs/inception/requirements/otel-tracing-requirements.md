# OpenTelemetry Tracing Improvement Requirements

## Document Metadata
- Date: 2026-03-11
- Request Type: Enhancement
- Scope: Multiple components and services
- Complexity: Moderate
- Source: User request + verification answers

## Intent Analysis
The project will modernize and expand frontend OpenTelemetry instrumentation so the UI can emit richer telemetry for page loads, route transitions, user interactions, network requests, and business operations, while preserving end-to-end trace continuity across UI requests and backend responses.

## Confirmed Decisions
- Security extension enforcement: Disabled for this workflow (non-blocking)
- Router tracing: Full route-level instrumentation
- Web vitals: Capture all supported web-vitals and export through OTel
- Business spans: Auto-instrument services and relevant component operations
- Trace propagation: Automatic for all HTTP requests
- Span detail: Comprehensive attributes, excluding PII/sensitive identifiers
- Error handling: Comprehensive exception and error events
- Sampling: No sampling (full fidelity)
- Backward compatibility: Enhance existing `CustomTracing.ts`
- Testing: Comprehensive automated validation
- Documentation: Inline comments/JSDoc only

## Functional Requirements

### FR-1: Unified Tracing Bootstrap
- Enhance tracing bootstrap so initialization is idempotent and reusable.
- Ensure provider setup, processors, exporter, context manager, and instrumentations initialize once.
- Expose a stable tracing API used by the application entry point and tracing helpers.

### FR-2: Route Navigation Tracing
- Instrument route transitions for all application routes.
- Create spans that capture navigation start/end, destination route, and transition outcomes.
- Include lazy-load/suspense timing signals where available.

### FR-3: Web Vitals to OpenTelemetry
- Capture supported web-vitals (including page-load-related metrics) and send via OpenTelemetry.
- Associate vitals events with active trace context when available.
- Preserve existing app behavior while expanding observability data.

### FR-4: Business Operation Spans
- Add spans for business-critical flows including search, checkout, and related service orchestration.
- Add operation attributes such as action name, route, request type, status, and timing.
- Include child spans or events for significant sub-steps and delays.

### FR-5: End-to-End Trace Continuity (UI -> Backend -> UI)
- Ensure outbound browser requests carry standard trace context headers automatically.
- Preserve trace parent/child relationships through request and response lifecycles.
- Ensure UI spans correctly represent backend-dependent latency and outcomes.

### FR-6: Enhanced Error Tracing
- Record exception events and error metadata on failed operations.
- Set span status to error on failures and include useful non-sensitive diagnostics.
- Capture asynchronous failures and cancellations where possible.

### FR-7: Backward-Compatible Custom Tracing API
- Upgrade `CustomTracing.ts` so existing call patterns continue to work.
- Add richer helpers for wrapping async operations and annotating spans.
- Maintain compatibility while enabling migration to improved APIs.

### FR-8: Trace Validation Coverage
- Add/extend tests to verify trace creation, context propagation, header propagation, and error-span behavior.
- Validate route and service-level instrumentation behavior with automated tests.
- Keep test suite aligned with current CI setup.

## Non-Functional Requirements

### NFR-1: Privacy and Data Minimization
- Do not include PII or sensitive user identifiers in span attributes.
- Avoid full query-string payloads or unredacted personal data in telemetry.
- Keep telemetry payloads diagnostically useful and privacy-safe.

### NFR-2: Performance
- Instrumentation must not cause noticeable UI regressions during normal usage.
- Keep tracing overhead lightweight and avoid blocking critical render paths.

### NFR-3: Reliability
- Tracing failures must never break core user flows.
- Exporter/network failures should degrade gracefully.

### NFR-4: Maintainability
- Keep tracing logic modular, typed, and easy to extend.
- Use clear inline comments only where logic is non-obvious.

### NFR-5: Observability Quality
- Emit consistent span naming and attributes for route, HTTP, and business spans.
- Ensure trace trees are navigable and meaningful in backend observability tools.

## Quality and Validation Criteria
- Route transitions produce trace spans with timing and route attributes.
- Outbound backend calls include trace context headers and correlate in trace backend.
- Web-vitals metrics are emitted through OTel pipeline.
- Business operations (search/checkout) generate spans and error events.
- No PII is emitted in span attributes.
- Automated tests verify tracing behavior and pass in CI.

## Out of Scope
- Backend instrumentation changes outside frontend repository.
- Security extension mandatory gating (disabled by explicit user decision).
- New external documentation files beyond existing project structure.

## Extension Compliance Summary
- security-baseline: N/A (disabled by user choice in requirements answers)

## Approval Gate
Requirements analysis is complete for the OpenTelemetry tracing enhancement request. User approval is required before proceeding to Workflow Planning.
