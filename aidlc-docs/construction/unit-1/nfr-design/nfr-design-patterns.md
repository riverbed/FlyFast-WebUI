# NFR Design Patterns - Unit 1: Tracing Core Modernization

**Unit**: Unit 1 - Tracing Core Modernization  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-11  

---

## Executive Summary

This document defines design patterns that incorporate the 7 approved NFR Requirements into Unit 1's implementation. These patterns ensure idempotent initialization, backward-compatible wrapper enhancement, graceful degradation, data safety, and testability foundations that enable Unit 2 instrumentation expansion.

---

## Pattern 1: Singleton Idempotent Initialization

**Pattern Name**: Guard-Protected Singleton Provider Setup  
**NFR Source**: NFR-1 (Performance), NFR-2 (Reliability), NFR-4 (Maintainability)  
**Tech Decision**: TD-1 (Tracing Provider Lifecycle Strategy)

### Problem
React strict mode and hot reload cause repeated \Tracing()\ invocations. Registering OTel instrumentations multiple times causes duplicate span generation and inconsistent context behavior. Performance penalty from repeated setup is unacceptable.

### Solution

**Module-Level Initialization Guard**:
- Guard 1: Always-fast path for repeated invocations (constant-time check after first init)
- Guard 2: Prevent concurrent initialization attempts (serialization)
- Guard 3: Safe initialization sequence (wrapped in try-catch with degradation fallback)

### Design Constraints
- Initialization state is immutable after first successful call
- Repeated calls return cached provider in constant time (< 1ms)
- Concurrent initialization attempts are serialized
- Under React strict mode (double mount), second invocation always returns cached state
- No global state mutation visible to caller

---

## Pattern 2: Graceful Degradation with No-Op Fallback

**Pattern Name**: Functional Nulling Strategy  
**NFR Source**: NFR-2 (Reliability), NFR-6 (Testability)  
**Tech Decision**: TD-1, TD-5 (Error Semantics)

### Problem
When initialization fails (exporter unavailable, instrumentation registration fails), the app must continue functioning. Throwing exceptions breaks user experience. Returning null causes null-check burden everywhere.

### Solution

**Degraded Result Pattern**:
- Failed initialization never throws to caller
- Degraded tracer implements full tracer interface with no-op semantics
- Diagnostic events capture failure context (NOT error stack traces with PII)
- Application continues with all user functionality intact
- Test can verify degradation by checking result.success === false

### Design Constraints
- Degraded result provides safe fallback tracer that accepts all method calls
- Diagnostic fields contain only: timestamp, failure reason (sanitized), init attempt count
- Stack traces explicitly excluded from diagnostic export
- No-op tracer methods (startSpan, end, setStatus) all return immediately

---

## Pattern 3: Backward-Compatible Wrapper Enhancement

**Pattern Name**: Progressive API Expansion  
**NFR Source**: NFR-4 (Maintainability), NFR-1 (Performance)  
**Tech Decision**: TD-4 (Custom Tracing Compatibility)

### Problem
Existing code uses \customTracing(name: string, promise: Promise<T>)\ pattern. Unit 1 needs to introduce new helper APIs (start/end span explicitly, record errors, set attributes) without forcing migration of all callsites.

### Solution

**Preserve Legacy + Extend with New Helpers**:
- LEGACY: Keep \customTracing(name, promise)\ signature completely unchangedsafe for all existing callsites
- NEW: Introduce TracingHelpers object with new patterns:
  - \withSpan<T>(name, callback)\ - Async operation with automatic context
  - \withSpanSync<T>(name, callback)\ - Synchronous operation with span
  - \safeSetAttributes(span, attrs)\ - Safe attribute setting with type conversion

### Design Constraints
- \customTracing(name, promise)\ behavior unchanged
- New helpers follow async error handling pattern (catch  recordException  rethrow)
- New APIs always safe to call even in degraded mode (return noOps)
- Callsites can gradually adopt new helpers without breaking changes
- Legacy path tested to ensure zero regression

---

## Pattern 4: Data Hygiene and PII Exclusion

**Pattern Name**: Attribute Filtering with Allowlist Strategy  
**NFR Source**: NFR-3 (Data Safety), NFR-5 (Observability Quality)  
**Tech Decision**: TD-6 (Data Hygiene Strategy)

### Problem
Unit 1 must guarantee "no PII in telemetry payloads" per NFR-3. Application code might inadvertently pass user IDs, query params, or sensitive values. Relying on developer discipline is insufficient.

### Solution

**Attribute Filtering at Export Time**:
- Maintain UNIT1_SAFE_ATTRIBUTES allowlist of safe attribute names
- Filter all span attributes through allowlist before export
- Safe attributes include: span lifecycle fields, performance metrics, sanitized request path (no params)
- Reject PII patterns: user identifiers, email addresses, authentication tokens, query parameters
- Diagnostic events sanitized: only timestamp, failureReason (with patterns removed), init attempt count

### Design Constraints
- All span attributes pass through allowlist filter before export
- Filtering happens at export time, not at span creation time
- New attributes can only be added to allowlist with explicit review
- Type conversion to primitives only (no objects/arrays exported)
- Test verifies that no PII attributes escape to export layer

---

## Pattern 5: Error Recording with Safe Diagnostics

**Pattern Name**: Structured Error Capture  
**NFR Source**: NFR-2 (Reliability), NFR-3, NFR-6 (Testability)  
**Tech Decision**: TD-5 (Error Semantics Strategy)

### Problem
When traced operations fail, diagnostic context (error message, type) is valuable. However, error stack traces often contain file paths, user data, and sensitive context. Need structured error semantics without PII leakage.

### Solution

**Safe Error Recording Pattern**:
- Set error status at span level via recordException()
- Record sanitized error attributes: error.type (Error.name), error.message (max 500 chars, PII patterns removed)
- Remove stack traces entirely (contain file paths, line numbers)
- Cause chains limited to 1 level only
- Sanitization removes: email addresses, URLs, large numbers (10+ digits)

### Design Constraints
- Every error-ending span must call recordSafeError() or equivalent
- Error messages sanitized for PII before export
- Stack traces never exported to telemetry backend
- Error context is deterministic and testable
- Test verifies error scenarios produce consistent, safe attributes

---

## Pattern 6: Context Zone Boundary Management

**Pattern Name**: Explicit Async Context Binding  
**NFR Source**: NFR-5 (Observability Quality), NFR-2 (Reliability)  
**Tech Decision**: TD-2 (Context Management Strategy)

### Problem
OTel's automatic async context propagation (AsyncLocalStorage) works most of the time, but can lose context during React state updates, event handlers, or setTimeout calls that cross zone boundaries. Unit 1 should provide both automatic AND explicit context binding for Unit 2 to use.

### Solution

**Dual-Mode Context Management**:
- Automatic context via OTel's AsyncLocalStorage (existing behavior, no changes)
- Explicit binding available for known zone crossings (React event handlers, timers)
- \contextBridge<T>(callback)\ - Run callback with active context
- \withTraceContext(spanName, eventHandler)\ - Wrapped handler that preserves context
- Automatic context works for 95%+ of scenarios; explicit binding optional for edge cases

### Design Constraints
- Automatic context (OTel async hooks) unchangedtransparent to app
- Explicit binding available as opt-in for known zone crossings
- No breaking changes to existing async context behavior
- Test verifies context is preserved across promise chains and React renders

---

## Pattern 7: Testing Seams and Initialization Assertions

**Pattern Name**: Observable Initialization State for Test Harness  
**NFR Source**: NFR-6 (Testability), NFR-2 (Reliability)  
**Tech Decision**: TD-7 (Testing Strategy)

### Problem
Tests need to verify: initialization happened exactly once (idempotency), degraded mode triggered on failures, no duplicate instrumentation registered, wrapper error handling works. Existing tests can't inspect internal state.

### Solution

**Test-Exposed State Getter Functions**:
- \__TEST_ONLY__.getInitializationState()\ - Returns state: 'uninitialized' | 'initializing' | 'initialized' | 'degraded'
- \__TEST_ONLY__.getInitializationCallCount()\ - Returns call count for duplicate detection
- \__TEST_ONLY__.getCachedProvider()\ - Returns cached provider without side effects
- \__TEST_ONLY__.getDiagnosticEvents()\ - Returns array of diagnostic events
- \__TEST_ONLY__.resetTracingState()\ - Clears state for test isolation

### Design Constraints
- Test helpers exported under \__TEST_ONLY__\ namespace to clearly mark test-only APIs
- Reset function completely clears state for test isolation
- Diagnostic events captured and accessible for verification
- Test seams don't expose internal implementation details
- Test coverage protects idempotency and degradation guarantees

---

## Summary: Pattern Interplay

| Pattern | NFR Addressed | Unit 2 Integration | Risk Mitigation |
|---------|---------------|------------------|-----------------|
| Idempotent Initialization | 1, 2, 4 | Core foundation | Guard gates + test assertions |
| Graceful Degradation | 2, 6 | Error resilience | No-op fallback + diagnostics |
| Backward-Compatible Enhancement | 4, 1 | New API stability | Legacy path unchanged |
| Data Hygiene | 3, 5 | PII filter baseline | Allowlist + export-time filtering |
| Safe Error Recording | 2, 3, 6 | Error telemetry | Sanitization + structured attrs |
| Context Zone Binding | 5, 2 | Unit 2 instrumentation | Dual-mode (auto + explicit) |
| Testing Seams | 6, 2 | Test coverage | Observable state + reset hooks |

All patterns are designed to be **stable, composable, and testable** to support Unit 2 expansion without modification to Unit 1 core contracts.
