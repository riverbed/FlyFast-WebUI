# Unit 2 NFR Requirements Plan

## Unit Context
**Unit 2**: TypeScript Conversion  
**Scope**: Convert JavaScript React codebase to TypeScript with strict checks while preserving existing behavior and UI  
**Type**: Quality, maintainability, and delivery risk control (no new functionality)

## Overview
This plan defines non-functional requirements for Unit 2 to ensure the TypeScript migration is safe, maintainable, and productive for ongoing development.

---

## NFR Assessment Steps

- [x] **Step 1**: Understand Unit 2 conversion scope
- [x] **Step 2**: Generate NFR clarifying questions
- [x] **Step 3**: Collect user answers
- [x] **Step 4**: Create NFR requirements document
- [x] **Step 5**: Define tech stack and typing decisions
- [ ] **Step 6**: Present for approval

---

## Key NFR Areas for Unit 2

### 1. Conversion Safety & Incremental Delivery

**Context**: Unit 2 touches many source files. Safe sequencing and rollback readiness reduce migration risk.

**Concerns**:
- Incremental conversion approach and batching strategy
- Error budget for temporary `any`/casts
- Build/test gate expectations during conversion
- Rollback and checkpoint preferences

---

### 2. Type Quality & Strictness

**Context**: Strict TypeScript is only effective when type escapes are controlled.

**Concerns**:
- Allowed use of `any`, non-null assertions, and suppression comments
- Definition of done for typed modules
- DTO/interface modeling strategy
- Shared type utilities and reuse conventions

---

### 3. Developer Experience & Throughput

**Context**: Conversion should improve, not degrade, day-to-day development speed.

**Concerns**:
- Type-check feedback loop targets
- Preferred lint/type enforcement level during migration
- IDE autocomplete and diagnostics expectations
- Refactor ergonomics for components and hooks

---

### 4. Runtime Stability & UI Preservation

**Context**: UI/UX and runtime behavior must remain unchanged while types are introduced.

**Concerns**:
- Runtime parity verification depth
- Component contract validation expectations
- Handling third-party libraries with incomplete typings
- Acceptance criteria for “no behavior changes”

---

## Clarifying Questions

### Question 1: Conversion Execution Strategy

**Options**:
- **A**: Vertical slices - Convert feature by feature (pages/components/services per flow)
- **B**: Layered - Convert shared services/types first, then components/pages
- **C**: Bulk - Convert most files quickly, stabilize after
- **D**: Hybrid - Start layered for foundations, then finish with vertical slices

**Question**: Which conversion strategy should guide Unit 2 execution?

[Answer]: B

---

### Question 2: Temporary Type Escape Policy

**Options**:
- **A**: Zero tolerance - No `any`, no `@ts-ignore`, no unsafe casts
- **B**: Strict with exceptions - Allow minimal escapes with explicit TODO and owner
- **C**: Pragmatic - Allow escapes where needed, tighten later
- **D**: Fast migration - Prioritize conversion speed over temporary type quality

**Question**: What policy should we enforce for temporary type escapes during migration?

[Answer]: C

---

### Question 3: Strictness Enforcement During Migration

**Options**:
- **A**: Full strict gate - All converted files must pass strict checks immediately
- **B**: Progressive strict gate - New/converted files strict, legacy allowance temporarily
- **C**: Build-first gate - Compile must pass, strictness tightened after full conversion
- **D**: Flexible - Team discretion per file based on complexity

**Question**: How should strictness be enforced while migration is in progress?

[Answer]: A

---

### Question 4: Definition of Done for Converted Files

**Options**:
- **A**: Type-clean + tests + runtime parity verified
- **B**: Type-clean + runtime parity; tests where already present
- **C**: Type-clean only for now; broader validation later
- **D**: Compiles without blocking errors; polish later

**Question**: What should be the definition of done for each converted file/module?

[Answer]: C

---

### Question 5: Third-Party Typings Strategy

**Options**:
- **A**: Install official/community typings only; avoid local shims
- **B**: Allow local declaration shims for gaps, replace later if possible
- **C**: Use broad `any` wrappers around untyped libraries
- **D**: Skip strict typing for external boundaries during migration

**Question**: How should we handle libraries with missing or weak type definitions?

[Answer]: C

---

### Question 6: Performance Targets for Developer Loop

**Options**:
- **A**: Aggressive - type-check < 5s incremental, < 30s full
- **B**: Standard - type-check < 10s incremental, < 60s full
- **C**: Acceptable - type-check < 20s incremental, < 90s full
- **D**: No explicit targets - optimize only if pain is observed

**Question**: What developer feedback-loop targets should we use for TypeScript checks?

[Answer]: A

---

### Question 7: Runtime and UI Parity Validation Depth

**Options**:
- **A**: Comprehensive - critical paths + visual verification for key pages
- **B**: Standard - smoke test all pages and main booking flow
- **C**: Minimal - build success plus spot checks
- **D**: Existing checks only - rely on current baseline process

**Question**: What level of runtime/UI parity validation is required in Unit 2?

[Answer]: A

---

### Question 8: Documentation & Maintainability Expectations

**Options**:
- **A**: Comprehensive - migration notes, type conventions, and troubleshooting guide
- **B**: Standard - type conventions and key migration decisions documented
- **C**: Minimal - inline comments and short summary only
- **D**: Lightweight - no additional docs unless issues appear

**Question**: What documentation depth should Unit 2 produce for long-term maintainability?

[Answer]: C

---

## Analysis Preparation

After answers are provided, the following checks will be performed:

1. **Ambiguity Check**: Identify vague or non-actionable responses
2. **Contradiction Check**: Ensure answers align with strict TS and UI preservation goals
3. **Completeness Check**: Confirm all answers provide execution-ready direction
4. **Follow-up Questions**: Ask only where ambiguity remains

---

## Next Steps After Answer Review

1. Generate `nfr-requirements.md` for Unit 2
2. Generate Unit 2 tech-stack/type decisions document
3. Define concrete quality gates for conversion batches
4. Present results for approval before NFR Design stage

---

**Document Version**: 1.0  
**Created**: 2026-03-09
