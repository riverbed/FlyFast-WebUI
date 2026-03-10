# NFR Requirements - Unit 2: TypeScript Conversion

**Unit**: Unit 2 - TypeScript Conversion  
**Phase**: CONSTRUCTION  
**Stage**: NFR Requirements  
**Duration Estimate**: 8-12 hours  
**Date Generated**: 2026-03-09  

---

## Executive Summary

Unit 2 converts the JavaScript React codebase (~29 source files) to TypeScript with strict type checking while preserving all existing functionality and UI/UX. This unit builds on the TypeScript configuration established in Unit 1 and must maintain runtime parity with zero behavior changes.

The conversion follows a **layered approach** (services/types first, then components/pages) with **full strict enforcement**, **pragmatic type escapes** permitted where needed, and **comprehensive validation** to ensure UI preservation.

---

## Non-Functional Requirements by Category

### 1. Conversion Safety & Delivery Risk Control

**Requirement**: Execute TypeScript conversion using a layered approach that minimizes risk and enables incremental validation.

**Rationale**: User selected "Layered - Convert shared services/types first, then components/pages" (Answer Q1=B), indicating preference for foundational stability before scaling conversion.

**Implementation Strategy**:
- **Phase 1**: Convert shared services and utilities
  - `src/services/Functions.ts` ✅ (already completed in Unit 1)
  - `src/services/Context.js` → `Context.tsx`
  - `src/services/Flight.js` → `Flight.ts`
  - `src/services/Tracing.js` → `Tracing.ts`
  - `src/services/CustomTracing.js` → `CustomTracing.ts`
- **Phase 2**: Convert root-level infrastructure
  - `src/index.js` → `index.tsx`
  - `src/reportWebVitals.js` → `reportWebVitals.ts`
  - `src/setupProxy.js` → `setupProxy.ts`
  - `src/setupTests.js` → `setupTests.ts`
- **Phase 3**: Convert shared components (used by multiple pages)
  - `src/components/ApplicationContainer/*` (2 files)
  - `src/components/Authentication/*` (1 file)
  - `src/components/Search/*` (3 files + data files)
  - `src/components/TripCard/*` (2 files)
  - `src/components/Flight/*` (1 file)
  - `src/components/Cart/*` (3 files)
  - `src/components/Breakdown/*` (2 files)
  - `src/components/SearchResults/*` (3 files)
- **Phase 4**: Convert page components (top-level routes)
  - `src/pages/Home/*` (1 file)
  - `src/pages/SearchFlight/*` (1 file)
  - `src/pages/Checkout/*` (1 file)
- **Phase 5**: Convert application root
  - `src/App.js` → `App.tsx`

**Rollback Strategy**:
- Each phase completes with passing build before next phase begins
- Git commit after each phase for incremental checkpoint
- Build must pass strict TypeScript checks at each phase boundary

**Success Criteria**:
- All 29+ files converted from `.js` to `.ts`/`.tsx`
- Build passes with strict TypeScript checks after each phase
- No runtime errors introduced during conversion
- Layered conversion order documented for auditability

---

### 2. Type Quality & Strictness

**Requirement**: Enforce full strict TypeScript checks on all converted files while allowing pragmatic type escapes where necessary.

**Rationale**: User selected combination of "Full strict gate" (Answer Q3=A) with "Pragmatic type escapes" (Answer Q2=C), indicating high type safety standards with practical flexibility.

**Type Escape Policy**:
- **Allowed**: Explicit `any` type annotations where needed
- **Allowed**: Type assertions (`as Type`) when type inference fails
- **Allowed**: Non-null assertions (`!`) sparingly for known non-null values
- **Allowed**: `@ts-expect-error` with comment explaining why
- **Discouraged**: `@ts-ignore` (prefer `@ts-expect-error` for visibility)
- **Required**: Brief inline comment for each type escape justifying decision

**Strict Mode Enforcement**:
- All converted files must compile with `strict: true` enabled
- No relaxing of strict flags during conversion
- Type escapes are explicit annotations, not configuration changes
- Definition of done: File compiles cleanly with strict checks (Answer Q4=C)

**Type Modeling Standards**:
- Create explicit interfaces for component props
- Type all function signatures (params and returns)
- Type all React hooks (useState, useEffect, etc.)
- Use `unknown` instead of `any` where possible
- Prefer type inference for local variables where types are obvious

**Success Criteria**:
- All converted files pass `tsc --noEmit` with strict enabled
- Type escapes are documented with inline comments
- No implicit `any` types in converted files
- Props interfaces defined for all components

---

### 3. Third-Party Library Type Strategy

**Requirement**: Handle libraries with missing or incomplete type definitions using broad `any` wrappers to unblock conversion.

**Rationale**: User selected "Use broad `any` wrappers around untyped libraries" (Answer Q5=C), prioritizing conversion completion over perfect external typing.

**Implementation Approach**:
- **React and React DOM**: Already have excellent TypeScript support (@types packages installed in Unit 1)
- **Mantine v6**: TypeScript support included in package
- **React Router v6**: TypeScript support included in package
- **OpenTelemetry**: Strong TypeScript support included
- **http-proxy-middleware**: TypeScript support via @types package

**For Libraries Without Types**:
- Create minimal `*.d.ts` declaration files in `src/types/` directory
- Use broad `any` types for external library boundaries
- Add comment indicating types are placeholders
- Example:
  ```typescript
  // src/types/legacy-library.d.ts
  // Temporary broad types for untyped library - refine later if needed
  declare module 'legacy-library' {
    const lib: any;
    export default lib;
  }
  ```

**Priority**:
- Conversion velocity over type perfection for external deps
- Focus type quality on application code, not third-party wrappers
- Refinement can occur post-Unit 2 if value justifies effort

**Success Criteria**:
- No TypeScript compiler errors due to missing types
- All external library imports resolve successfully
- Application code maintains strict typing standards

---

### 4. Developer Experience & Performance

**Requirement**: Maintain aggressive TypeScript feedback loop performance to support productive development.

**Rationale**: User selected "Aggressive - type-check < 5s incremental, < 30s full" (Answer Q6=A), indicating performance is critical to developer experience.

**Performance Targets**:
- **Incremental type-check**: < 5 seconds (watching mode)
- **Full type-check**: < 30 seconds (`npm run type-check`)
- **Production build**: Maintain Unit 1 baseline (~60 seconds)

**Optimization Strategies**:
- Use TypeScript project references if needed for large codebase
- Enable `skipLibCheck: true` in tsconfig.json (already configured in Unit 1)
- Use incremental compilation (`"incremental": true`)
- Ensure IDE type-checking uses incremental mode
- Monitor type-check performance during conversion phases

**IDE Integration**:
- Type-checking must work seamlessly in VS Code, WebStorm, and similar IDEs
- Real-time error feedback as developers type
- Quick fix suggestions for common type errors
- IntelliSense and autocomplete for typed props and functions

**Success Criteria**:
- `npm run type-check:watch` responds in < 5s after file save
- `npm run type-check` completes in < 30s for full codebase
- No IDE performance degradation during TypeScript validation

---

### 5. Runtime Stability & UI Preservation

**Requirement**: Execute comprehensive runtime and UI parity validation to ensure TypeScript conversion introduces zero behavior changes.

**Rationale**: User selected "Comprehensive - critical paths + visual verification for key pages" (Answer Q7=A), indicating high priority on preserving existing functionality.

**Validation Strategy**:

**Automated Validation**:
- Build must succeed with no errors (`npm run build`)
- Type-check must pass with no errors (`npm run type-check`)
- Existing tests must pass (if present)

**Manual Validation - Critical User Paths**:
1. **Home Page Load**
   - Verify page renders correctly
   - Check OpenTelemetry tracing still initializes
   - Verify header and navigation components display

2. **Flight Search Flow**
   - Enter airport search (origin and destination)
   - Select dates from date picker (Mantine component)
   - Select seat class and trip type
   - Submit search
   - Verify results display correctly
   - Check "No results" scenario

3. **Flight Selection & Cart**
   - Select flight from results
   - Add to cart
   - Verify cart displays flight details
   - Test cart item removal
   - Test empty cart state

4. **Checkout Flow**
   - Navigate to checkout
   - Review flight details
   - Verify cost breakdown display
   - Check confirmation UI

**Visual Verification Points**:
- All Mantine components render correctly (DatePicker, Select, Button, etc.)
- Responsive layout preserved
- CSS and styling unchanged
- Icons render correctly (react-icons)
- Loading states function properly

**Runtime Validation**:
- No console errors in browser
- No React warnings in console
- OpenTelemetry traces generated successfully
- API proxy configuration works (setupProxy)
- Environment variable substitution preserved

**Acceptance Criteria**:
- All critical paths verified manually
- Zero visual regressions detected
- No runtime errors in browser console
- All existing functionality preserved

---

### 6. Documentation & Maintainability

**Requirement**: Provide minimal inline documentation for TypeScript conversion decisions.

**Rationale**: User selected "Minimal - inline comments and short summary only" (Answer Q8=C), preferring focused documentation over comprehensive guides.

**Documentation Deliverables**:
1. **Inline Comments**: Brief explanations for:
   - Type escape decisions (why `any` is used)
   - Complex type definitions that aren't self-evident
   - Workarounds for TypeScript limitations

2. **Short Summary Document**: `aidlc-docs/construction/unit-2/code/code-generation-summary.md`
   - Conversion approach (layered phases)
   - Key type modeling decisions
   - Notable challenges and solutions
   - Validation results summary

**NOT Required**:
- Comprehensive migration guide
- TypeScript best practices documentation
- Detailed troubleshooting guide
- Team training materials

**Success Criteria**:
- Type escapes include inline justification
- Summary document exists and covers key decisions
- No separate comprehensive documentation created

---

## Risk Assessment

### High Risks
- **React Component Props**: Typing props for 20+ components may reveal implicit assumptions
  - **Mitigation**: Use pragmatic `any` escapes with comments where needed
- **Mantine v6 Type Compatibility**: Ensure Mantine components work with strict TypeScript
  - **Mitigation**: Mantine v6 has TypeScript support; validate early in Phase 3

### Medium Risks
- **State Management Types**: Context API and useState typing may be complex
  - **Mitigation**: Convert Context.js early in Phase 1 to establish patterns
- **Event Handler Types**: React event types can be verbose
  - **Mitigation**: Use type inference where possible; create type aliases for common handlers

### Low Risks
- **Utility Function Types**: Most utilities have straightforward signatures
- **Build Performance**: TypeScript compilation adds minimal overhead for 29 files

---

## Dependencies & Prerequisites

**Requires Completion**:
- Unit 1: Dependency Updates & Configuration ✅
- TypeScript configuration in place ✅
- Strict mode enabled in tsconfig.json ✅

**Blocks**:
- Unit 3: Mantine v7 Migration (cannot proceed until TypeScript conversion complete)

---

## Quality Gates

Each conversion phase must pass:
1. ✅ Build succeeds (`npm run build`)
2. ✅ Type-check passes (`npm run type-check`)
3. ✅ Type-check performance within targets (< 5s incremental, < 30s full)
4. ✅ Manual validation of affected features
5. ✅ No console errors in browser
6. ✅ Git commit with phase completion marker

---

**Document Version**: 1.0  
**Created**: 2026-03-09  
**Answer Summary**: 1B, 2C, 3A, 4C, 5C, 6A, 7A, 8C
