# Unit 1 Code Generation Plan - Tracing Core Modernization

**Unit**: Unit 1 - Tracing Core Modernization  
**Phase**: CONSTRUCTION  
**Stage**: Code Generation - Part 1 (Planning)  
**Date**: 2026-03-11  

---

## Unit Scope Summary

**Purpose**: Modernize tracing bootstrap with idempotent initialization, backward-compatible wrapper enhancement, graceful degradation, and data safety enforcement. Provide stable foundation for Unit 2 instrumentation expansion.

**Stories Implemented by This Unit**:
- FR-1: Modernize tracing bootstrap and API stability
- FR-7: Preserve backward compatibility with existing CustomTracing.ts

**Code Files to Modify** (Brownfield):
- \src/services/Tracing.ts\ - Modernize provider setup and initialization guard
- \src/services/CustomTracing.ts\ - Enhance wrapper with new APIs while preserving legacy behavior
- \src/services/__tests__/Tracing.test.ts\ - Extend test coverage for idempotency and degradation
- \src/services/__tests__/CustomTracing.test.ts\ - Extend test coverage for new wrapper APIs

**Design Patterns Implemented**:
1. Singleton Idempotent Initialization
2. Graceful Degradation
3. Backward-Compatible Enhancement
4. Data Hygiene & PII Exclusion
5. Test Seams

**NFR Mapping**:
- NFR-1 (Performance): Idempotent guard, constant-time cached return
- NFR-2 (Reliability): Graceful degradation, no-op fallback
- NFR-3 (Data Safety): Attribute filtering, PII exclusion
- NFR-4 (Maintainability): Modular patterns, clear responsibilities
- NFR-5 (Observability): Consistent naming, deterministic diagnostics
- NFR-6 (Testability): Observable state, reset hooks
- NFR-7 (Operational Consistency): Dev/prod parity

---

## Code Generation Steps

### Step 1: Analyze Project Structure and Dependencies
- [ ] Confirm workspace paths: \src/services/\, \src/\ locations
- [ ] Review current \Tracing.ts\ initialization pattern and exports
- [ ] Review current \CustomTracing.ts\ legacy call patterns
- [ ] Verify OTel package versions in package.json
- [ ] Document existing test structure and mocking patterns
- **Deliverable**: Project structure confirmed, dependencies verified

### Step 2: Generate Modernized Tracing.ts (Singleton Idempotent Initialization)
- [ ] Implement module-level state (isTracingInitialized, cachedTracerProvider, isInitializing)
- [ ] Implement fast-path guard check (< 1ms for repeated calls)
- [ ] Implement concurrent initialization serialization
- [ ] Implement try-catch wrapper with degradation fallback
- [ ] Create BatchSpanProcessor with OTel configuration
- [ ] Register auto-instrumentations (DocumentLoad, Fetch, XHR, UserInteraction)
- [ ] Set up AsyncLocalStorage context manager
- [ ] Implement TracingInitResult return type
- [ ] Implement clean exports (Tracing, getActiveTracer, __TEST_ONLY__)
- **Files Modified**: \src/services/Tracing.ts\
- **Rule/NFR**: BR-1, BR-2, BR-3, BR-8, NFR-1, NFR-2, NFR-4

### Step 3: Generate Enhanced CustomTracing.ts (Backward Compatibility + New APIs)
- [ ] Preserve legacy \customTracing(name, promise)\ signature unchanged
- [ ] Introduce TracingHelpers.withSpan (async span lifecycle)
- [ ] Introduce TracingHelpers.withSpanSync (sync span lifecycle)
- [ ] Introduce TracingHelpers.safeSetAttributes (type-safe attribute setting)
- [ ] Implement recordSafeError (sanitized error recording with no-op return)
- [ ] Implement error message sanitization (remove PII patterns)
- **Files Modified**: \src/services/CustomTracing.ts\
- **Rule/NFR**: BR-6, BR-7, BR-9, BR-10, NFR-3, NFR-4

### Step 4: Implement Data Sanitization Layer
- [ ] Create UNIT1_SAFE_ATTRIBUTES allowlist
- [ ] Implement createSafeAttributes filter function
- [ ] Implement sanitizeDiagnosticEvent function
- [ ] Implement sanitizeMessage for PII removal (emails, URLs, tokens)
- [ ] Apply filtering at span export time
- [ ] Add inline comments documenting allowlist
- **Files Modified**: \src/services/Tracing.ts\
- **Rule/NFR**: BR-10, BR-11, NFR-3

### Step 5: Extend Tracing.test.ts (Idempotency and Degradation)
- [ ] Add beforeEach: \__TEST_ONLY__.resetTracingState()\ for test isolation
- [ ] Add test suite: "Initialization Idempotency"
  - Repeated calls return same provider
  - Call count tracking works
- [ ] Add test suite: "Graceful Degradation"
  - Failed init returns success:false
  - Degraded tracer works (no-op calls)
  - App continues without exception
- [ ] Add test suite: "No Duplicate Instrumentation"
  - Fetch/XHR/DocumentLoad registered exactly once
- [ ] Verify existing test baseline passes (update with rationale if needed)
- **Files Modified**: \src/services/__tests__/Tracing.test.ts\
- **Rule/NFR**: BR-12, BR-13, NFR-6

### Step 6: Extend CustomTracing.test.ts (New Wrapper APIs)
- [ ] Add test setup with tracing reset
- [ ] Add test suite: "Legacy customTracing Behavior" (backward compat)
- [ ] Add test suite: "Enhanced withSpan API"
- [ ] Add test suite: "Safe Error Recording" (sanitization verified)
- [ ] Add test suite: "safeSetAttributes" (null handling, type conversion)
- [ ] Verify existing test baseline passes (update with rationale if needed)
- **Files Modified**: \src/services/__tests__/CustomTracing.test.ts\
- **Rule/NFR**: BR-12, BR-13, NFR-3, NFR-6

### Step 7: Verify Bootstrap and Integration Tests
- [ ] Confirm \src/index.tsx\ still calls \Tracing()\ at startup (no changes needed)
- [ ] Run \src/index.test.tsx\ tests - verify no regressions
- [ ] Fix any test failures or document rationale (BR-13)
- **Files Verified**: \src/index.tsx\, \src/index.test.tsx\
- **Acceptance**: Bootstrap integration remains functional

### Step 8: Create Documentation Artifacts
- [ ] Create \idlc-docs/construction/unit-1/code/tracing-implementation-summary.md\
  - Idempotent guard strategy, graceful degradation, data sanitization
  - Test seams and reset pattern
- [ ] Create \idlc-docs/construction/unit-1/code/api-contracts.md\
  - Tracing.ts exports, CustomTracing.ts exports, __TEST_ONLY__ API
  - Error handling contract, degradation paths
- **Files Created**: Documentation artifacts (aidlc-docs/ only)
- **Acceptance**: Reference ready for Unit 2

### Step 9: Verify TypeScript Strict Mode
- [ ] Run \
pm run type-check\ or \	sc --noEmit\
- [ ] Ensure zero type errors in modified files
- [ ] Fix any issues
- **Acceptance**: Type check passes

### Step 10: Build Verification
- [ ] Run \
pm run build\
- [ ] Verify production build succeeds without errors
- [ ] Note any bundle size changes (should be minimal)
- **Acceptance**: Build completes successfully

### Step 11: Run Full Test Suite
- [ ] Run \
pm test -- --run\
- [ ] Verify all unit test suites pass
- [ ] Verify no regressions in existing tests
- **Acceptance**: All tests green

### Step 12: Final Compliance Checklist
- [ ] BR-1 (Single init): Idempotent guard implemented
- [ ] BR-2 (Reuse): Cached provider returned on repeat calls
- [ ] BR-3 (Safe init): No exceptions break app on failure
- [ ] BR-4 (Stable access): getActiveTracer exposed
- [ ] BR-5 (State visibility): __TEST_ONLY__.getInitializationState() available
- [ ] BR-6 (Legacy compat): customTracing signature unchanged
- [ ] BR-7 (Progressive): New helpers preserve legacy guarantees
- [ ] BR-8 (Non-blocking): Tracing failures contained
- [ ] BR-9 (Error trace): Errors recorded with safe diagnostics
- [ ] BR-10 (No PII): Attribute allowlist enforced
- [ ] BR-11 (Minimization): Only safe attributes exported
- [ ] BR-12 (Deterministic): Behavior testable via __TEST_ONLY__ API
- [ ] BR-13 (Regression): Existing tests pass or updated
- [ ] NFR-1-7: All NFRs addressed in code and tests
- **Deliverable**: Complete Unit 1 implementation verified

---

## Execution Summary

| Step | Task | Files | Complexity |
|------|------|-------|-----------|
| 1 | Analyze structure | (read) | Low |
| 2 | Generate Tracing.ts | src/services/ | High |
| 3 | Generate CustomTracing.ts | src/services/ | Medium |
| 4 | Implement sanitization | src/services/ | Medium |
| 5 | Extend Tracing tests | src/__tests__/ | Medium |
| 6 | Extend CustomTracing tests | src/__tests__/ | Medium |
| 7 | Verify integration | src/ | Low |
| 8 | Create docs | aidlc-docs/ | Low |
| 9 | Type check | (npm) | Low |
| 10 | Build check | (npm) | Low |
| 11 | Run tests | (npm) | Low |
| 12 | Final checklist | (verify) | Low |

**Total Steps**: 12 sequential steps
**Estimated Output**:
- Modified: 6 files in src/services/ and src/__tests__/
- Created: 2 documentation files in aidlc-docs/
- Verified: 3 existing files (no changes needed)
- Tests Generated: ~40 test cases (idempotency, degradation, backward compat, sanitization)

---

## Ready for Approval?

This plan provides detailed, sequential steps to implement Unit 1 tracing core modernization:
-  Idempotent initialization with constant-time guard
-  Graceful degradation ensuring app continuity
-  Backward-compatible wrapper enhancement
-  PII exclusion enforcement at export layer
-  Comprehensive test coverage
-  Type-safe strict mode compliance
-  Full build and test verification

**Next Step**: Await explicit approval to proceed to Part 2 (Code Generation Execution).

---
