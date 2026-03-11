# Unit 2 NFR Requirements Plan - Route-Level Instrumentation

## Unit Context
**Unit 2**: Route-Level Span Instrumentation & Business Operations Tracing  
**Scope**: Expand telemetry coverage for React Router transitions, web vitals, and service-level business operations  
**Dependencies**: Unit 1 (Tracing core bootstrap) must be complete and stable  
**Type**: Observability expansion (new instrumentation paths, not new features)

---

## NFR Assessment Checklist

- [x] **Step 1**: Review Unit 1 outputs and route instrumentation requirements
- [x] **Step 2**: Generate NFR clarifying questions  
- [x] **Step 3**: Collect user answers
- [x] **Step 4**: Create NFR requirements document
- [x] **Step 5**: Define tech stack decisions for instrumentation
- [x] **Step 6**: Present for approval

---

## Key NFR Areas for Unit 2

### 1. Span Instrumentation Coverage & Hierarchy

**Context**: Route transitions, web vitals, and service operations need proper span structure with parent-child relationships.

**Concerns**:
- Route transition span naming conventions (e.g., `http.client.request`, custom naming)
- Span hierarchy: how page transitions relate to service operations
- Attribute naming standards across all span types
- PII filtering for attributes (route params, query strings, response data)

---

### 2. Performance & Tracing Overhead

**Context**: Instrumentation must not add perceptible latency to user interactions.

**Concerns**:
- Acceptable tracing overhead for route transitions (< 1ms?)
- Web vitals metric collection strategy (async, blocking, sampled)
- Span processor strategy (simple vs batch) for high-frequency events
- Memory footprint of accumulated spans before export

---

### 3. Error Handling & Resilience

**Context**: Failed tracing should not break application functionality.

**Concerns**:
- Graceful degradation when backend tracing endpoint unavailable
- Error event capture strategy (errors in operations, propagation failures)
- Timeout and retry policy for span export
- Fallback behavior for route transitions if tracing fails

---

### 4. Data Safety & PII Protection

**Context**: Route parameters and service payloads may contain customer/booking data.

**Concerns**:
- Which route parameters are safe to record as span attributes
- How to sanitize search/flight/checkout operation attributes
- Error message filtering for PII (emails, phone, booking refs)
- Sensitive header filtering before propagation

---

### 5. Trace Correlation & Backend Integration

**Context**: Frontend traces must correlate with backend spans across HTTP boundaries.

**Concerns**:
- Trace context propagation headers (W3C TraceContext standard?)
- Span ID/Trace ID format compatibility with backend
- Service boundary identification (which service is "this"?)
- Cross-origin request handling (browser CORS, tracing headers)

---

### 6. Sampling & Data Volume Control

**Context**: Capturing every route transition could generate high volume.

**Concerns**:
- Should all route transitions be traced or a percentage?
- Trace sampling implications: distributed trace visibility
- Error-sensitive sampling (always trace errors?)
- Web vitals sampling strategy

---

### 7. Integration with Existing Code

**Context**: Route instrumentation must cooperate with Unit 1 tracing bootstrap.

**Concerns**:
- How route spans parent to the application initialization span
- Interaction with existing `customTracing()` calls in services
- Re-initialization if route hooks run before Unit 1 bootstrap completes
- Integration with reportWebVitals callback

---

## Clarifying Questions

### Question 1: Route Transition Span Naming Convention

Which naming convention should route transition spans follow?

**Options**:
- **A**: HTTP-style (`http.client.route`, `http.client.page`) for consistency with OTel spec
- **B**: Application-centric (`app.navigation.to.page`, `app.route.transition`)
- **C**: Page-name-based (span name = current page name: "SearchFlight", "Checkout")
- **D**: Hierarchical (`navigation.route.transition`, `navigation.render.complete`)

[Answer]: A

---

### Question 2: Acceptable Tracing Overhead Budget

What is the maximum acceptable overhead for route transition instrumentation?

**Options**:
- **A**: Very strict (< 0.5ms overhead per route change)
- **B**: Strict (< 1ms overhead per route change)
- **C**: Acceptable (< 5ms overhead per route change)
- **D**: No specific budget, optimize only if users report slowness

[Answer]: D

---

### Question 3: Web Vitals Integration Approach

How should Web Vitals metrics be integrated with tracing?

**Options**:
- **A**: Emit each vital as a standalone event/span
- **B**: Record vitals as attributes on the page transition span
- **C**: Create separate "web-vitals" parent span containing all metrics as child spans
- **D**: Send to separate metrics pipeline, don't integrate with traces

[Answer]: B

---

### Question 4: Error Event Capture for Service Operations

When a flight search, cart update, or checkout operation fails, what should be captured?

**Options**:
- **A**: Full error object serialized as attribute (may include sensitive data)
- **B**: Error name + code only, sanitized error message
- **C**: Error name + code + response status, no message or body data
- **D**: Minimal - just mark span as error, no details

[Answer]: A

**Clarification Resolution (2026-03-11)**: Capture full error object, **then apply the blacklist filter** (Q5=B) to scrub known-sensitive keys before recording as span attribute. Blacklist applies to error object serialization as well as route attributes.

---

### Question 5: PII Filtering Strategy for Route Attributes

How aggressively should route parameters be filtered?

**Options**:
- **A**: Whitelist-based (only record known-safe params like `tripType`, `seatClass`)
- **B**: Blacklist-based (exclude known sensitive params like `userId`, `sessionId`, `bookingRef`)
- **C**: No filtering (record all route params as-is)
- **D**: Filter at export time (record everything, sanitize before sending)

[Answer]: B

---

### Question 6: Trace Context Propagation for Cross-Origin Requests

Should trace context headers be sent to external services?

**Options**:
- **A**: Yes - send W3C TraceContext headers to all outbound requests
- **B**: Yes - but only to same-origin API endpoints
- **C**: Conditional - send headers only if CORS allows and target service is internal
- **D**: No - don't propagate to external services (privacy/security boundary)

[Answer]: A

---

### Question 7: Span Sampling Strategy

Should every route transition create a span?

**Options**:
- **A**: Yes - 100% sampling (every route transition creates a span)
- **B**: High sampling (95%+ of transitions) with error-sensitive boost
- **C**: Balanced sampling (50-80%) with higher rate for error paths
- **D**: Low sampling (10-20%) to reduce data volume

[Answer]: A

---

### Question 8: Route Span Hierarchy & Relationship to Unit 1 Bootstrap Span

How should route transition spans relate to the application bootstrap span?

**Options**:
- **A**: Route spans are siblings of bootstrap (separate root spans)
- **B**: Route spans are children of an "application lifetime" parent span
- **C**: Route spans are independent; no parent relationship to bootstrap
- **D**: First route transition becomes child of bootstrap; subsequent transitions are sibling

[Answer]: A

---

### Question 9: Handling of Third-Party Route Changes

Should non-React Router navigation (direct history API, window.location) be traced?

**Options**:
- **A**: Yes - instrument History API to catch all navigations
- **B**: React Router only - only trace when React Router changes routes
- **C**: Both React Router and unhandled popstate events
- **D**: No - only trace explicit User Intent navigations

[Answer]: A

---

### Question 10: Service Operation Span Parent Assignment

When a flight search or checkout operation is initiated from a route, how should it relate?

**Options**:
- **A**: Service operation span is child of route transition span
- **B**: Service operation span is sibling to route transition span
- **C**: Service operation creates its own root span (independent)
- **D**: Service operations inherit the trace context but span hierarchy is flat

[Answer]: A

---

## Analysis Preparation

After answers are provided:

1. **Consistency Check**: Verify answers align with Unit 1 architecture (idempotent, minimal overhead)
2. **Completeness Check**: Ensure all 10 questions provide execution-ready direction
3. **Ambiguity Check**: Identify vague responses and ask follow-ups
4. **Traceability**: Map answers to specific code changes in route hooks and service wrappers

---

## Next Steps After Answer Review

1. Generate `unit-2/nfr-requirements/nfr-requirements.md` with detailed specifications
2. Generate `unit-2/nfr-requirements/tech-stack-decisions.md` with concrete implementation patterns
3. Define quality gates for route instrumentation coverage
4. Present results for approval before NFR Design stage

---

**Document Version**: 1.0  
**Created**: 2026-03-11  
**Unit**: Unit 2 - Route-Level Instrumentation (Correct Scope)
