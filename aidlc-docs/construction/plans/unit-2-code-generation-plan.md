# Unit 2 Code Generation Plan

## Unit Context
**Unit 2**: TypeScript Conversion  
**Scope**: Convert JavaScript React codebase to TypeScript with strict checks while preserving behavior and UI  
**Project Type**: Brownfield React SPA  
**Dependencies**:
- Unit 1 complete (dependencies updated, tsconfig.json, .npmrc, Functions.ts)
- NFR Requirements complete
- NFR Design complete

## Stories Implemented
- **User Stories**: Not applicable (User Stories skipped for this modernization effort)

## Interfaces and Contracts
- Preserve existing API contracts for `src/services/Flight` and `setupProxy` endpoints
- Preserve OpenTelemetry tracing initialization and span behavior
- Preserve component props and behavior across all routes
- No UI/UX changes (TypeScript-only migration)

## Files in Scope

### Services and Utilities
- `src/services/Context.js` → `Context.tsx`
- `src/services/Flight.js` → `Flight.ts`
- `src/services/Tracing.js` → `Tracing.ts`
- `src/services/CustomTracing.js` → `CustomTracing.ts`
- `src/services/Functions.ts` (already converted in Unit 1; verify types only)

### Root Infrastructure
- `src/index.js` → `index.tsx`
- `src/reportWebVitals.js` → `reportWebVitals.ts`
- `src/setupProxy.js` → `setupProxy.ts`
- `src/setupTests.js` → `setupTests.ts`
- `src/App.test.js` → `App.test.tsx`

### Components (All JSX)
- `src/components/**/**/*.js` → `**/*.tsx` (ApplicationContainer, Authentication, Search, TripCard, Flight, Cart, Breakdown, SearchResults)

### Pages (All JSX)
- `src/pages/**/**/*.js` → `**/*.tsx` (Home, SearchFlight, Checkout)

### App Root
- `src/App.js` → `App.tsx`

### Optional Type Declarations (if needed)
- `src/types/*.d.ts` (only for untyped third-party libraries)

---

## Code Generation Steps (Plan)

### Step 1: Pre-Conversion Validation
- [x] Confirm `tsconfig.json` strict mode settings are active and compatible with CRA
- [x] Confirm `@types/react`, `@types/react-dom`, `@types/node` installed
- [x] Confirm `npm run type-check` passes with current state

### Step 2: Phase 1 - Convert Services and Utilities
- [x] Convert `Context.js` to `Context.tsx` with fully typed context values and provider
- [x] Convert `Flight.js` to `Flight.ts` with typed API models and return types
- [x] Convert `Tracing.js` and `CustomTracing.js` to `.ts` with explicit types
- [x] Verify `Functions.ts` types are still accurate and referenced correctly
- [x] Update imports referencing converted service files

### Step 3: Phase 2 - Convert Root Infrastructure
- [x] Convert `index.js` to `index.tsx` and update React root typing
- [x] Convert `reportWebVitals.js` to `reportWebVitals.ts` with typed callback
- [x] Convert `setupProxy.js` to `setupProxy.ts` with pragmatic types as needed
- [x] Convert `setupTests.js` to `setupTests.ts` and ensure Jest typings
- [x] Convert `App.test.js` to `App.test.tsx` and update test typings

### Step 4: Phase 3 - Convert Shared Components (Batches)
- [x] Batch 3A: Convert ApplicationContainer components to `.tsx` with props interfaces
- [x] Batch 3B: Convert Authentication components to `.tsx` with props interfaces
- [x] Batch 3C: Convert Search components to `.tsx` with typed props and JSON typings
- [x] Batch 3D: Convert Display components (TripCard, Flight, Cart, Breakdown) to `.tsx`
- [x] Batch 3E: Convert SearchResults components to `.tsx` with typed props
- [x] Add `data-testid` attributes to interactive elements touched during conversion (buttons, inputs, links)

### Step 5: Phase 4 - Convert Page Components
- [x] Convert `Home.js` to `Home.tsx` and type page props/state
- [x] Convert `SearchFlight.js` to `SearchFlight.tsx` and type route/hooks
- [x] Convert `Checkout.js` to `Checkout.tsx` and type props/state

### Step 6: Phase 5 - Convert App Root
- [x] Convert `App.js` to `App.tsx` and type routing/lazy-load boundaries
- [x] Update any remaining imports to `.ts`/`.tsx` resolution if needed

### Step 7: Third-Party Type Handling
- [x] Add `src/types/*.d.ts` for any libraries lacking types (only if required)
- [x] Document all pragmatic `any` escapes with inline comments

### Step 8: Per-Phase Validation Gates
- [x] After each phase: run `npm run type-check` and record timing
- [x] After each phase: run `npm run build` and ensure success
- [x] After Phase 2+: run `npm start` and confirm no console errors
- [x] Perform manual validation per NFR Design (critical paths + visual checks)

### Step 9: Documentation Updates (Minimal)
- [x] Update `aidlc-docs/construction/unit-2/code/code-generation-summary.md` with conversion summary
- [x] Record type-check performance table and validation results summary

### Step 10: Plan Tracking
- [x] Mark each step checkbox immediately after completion
- [x] Ensure no duplicate files created (in-place modifications only)

---

## Story Traceability
- User Stories: Not applicable (skipped in workflow)
- NFR Requirements: All steps traceable to Unit 2 NFR Requirements and NFR Design artifacts

---

## Plan Notes
- This plan is the single source of truth for Unit 2 Code Generation.
- All file modifications must occur in-place (no duplicate files).
- Code generation must preserve UI/UX and runtime behavior.
- Strict TypeScript mode must remain enabled throughout.

---

**Total Steps**: 10  
**Document Version**: 1.0  
**Created**: 2026-03-09
