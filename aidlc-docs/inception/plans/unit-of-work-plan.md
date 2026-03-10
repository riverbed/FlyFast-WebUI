# Unit of Work Plan

## Overview

This plan defines the decomposition of FlyFast-WebUI modernization project into 3 sequential units. The decomposition strategy is based on the technical upgrade phases defined in the execution plan:

1. **Unit 1**: Dependency Updates & Configuration (Foundation)
2. **Unit 2**: TypeScript Conversion (Language Migration)
3. **Unit 3**: Mantine v7 Migration (Framework Upgrade)

**Decomposition Strategy**: Sequential/Phased - Each unit builds on the previous unit, with clear handoff points and coordination requirements.

**Rationale for Sequential Approach**:
- Unit 1 must complete first (provides TypeScript tooling and build configuration)
- Unit 2 must complete second (provides type-safe codebase foundation for Unit 3)
- Unit 3 executes last (builds on TypeScript-converted codebase)
- No parallelization possible due to strong dependencies

---

## Unit Definitions

### Unit 1: Dependency Updates & Configuration

**Scope**: Update all dependencies to latest versions, resolve peer dependency conflicts, configure TypeScript, update build system

**Components Affected**:
- package.json (22 direct dependencies)
- package-lock.json (entire dependency tree)
- Dockerfile (node base image version)
- Build configuration (react-scripts, TypeScript)

**Deliverables**:
- Updated package.json with latest versions
- New package-lock.json with clean dependency tree
- tsconfig.json (TypeScript configuration)
- Updated build system configuration
- Clean npm install (no --legacy-peer-deps required)

**Success Criteria**:
- [x] All dependencies updated to latest stable versions
- [x] No peer dependency warnings on clean install
- [x] TypeScript compiler installed and functional
- [x] Development server starts successfully
- [x] Production build completes successfully

**Hands-off to Unit 2**:
- TypeScript tooling ready
- Build system configured for .ts/.tsx files
- Development environment functional for code conversion

---

### Unit 2: TypeScript Conversion

**Scope**: Convert entire JavaScript codebase to TypeScript with strict mode

**Components Affected**:
- All 23 React components (.js → .tsx)
- All 6 service modules (.js → .ts)
- All utility functions (.js → .ts)
- Entry points (index.js, App.js)
- Type definitions for all APIs

**Files to Convert** (52 total):
- React components: 23 files
- Services: 6 files  
- Utilities/Functions: 5 files
- Entry/Config: 5 files
- Tests: 5 files
- Data files: 3 JSON files handled by TypeScript imports
- Styles: 2 CSS files (unchanged structurally)

**Deliverables**:
- All 52 source files converted to TypeScript (.ts/.tsx)
- Type definitions for components (props, state, hooks)
- Type definitions for services (function signatures, return types)
- Type definitions for API responses (Flight, Airport, Cart, etc.)
- tsconfig.json configured with strict mode
- Zero TypeScript compilation errors
- All imports properly typed

**Success Criteria**:
- [x] All .js files converted to .ts/.tsx
- [x] TypeScript compiles without errors
- [x] Strict mode enabled (no implicit any)
- [x] Type coverage > 95%
- [x] Development server runs with TypeScript
- [x] Production build succeeds

**Hands-off to Unit 3**:
- Type-safe codebase ready
- All components have proper typing
- No breaking changes from Mantine v6 are outstanding
- Ready for Mantine v7 API migration

---

### Unit 3: Mantine v7 Migration

**Scope**: Migrate all Mantine components from v6 to v7 API

**Components Affected**:
- All components using @mantine/core (Grid, Group, Paper, Button, etc.)
- All components using @mantine/dates (DatePickerInput)
- All components using @mantine/hooks (useLocalStorage)
- Styling system (may have breaking changes between v6 and v7)

**Mantine Components to Migrate**:
- Search component (Autocomplete, NativeSelect, DatePickerInput)
- Layout components (Grid, Group, Paper)
- Form components (Button, TextInput, etc.)
- App component (LoadingOverlay)
- Context component (useLocalStorage hook)
- All other @mantine components

**Deliverables**:
- All Mantine packages upgraded to v7.x
- All components using Mantine v7 API
- No deprecated v6 APIs in codebase
- Visual appearance preserved (no UI regressions)
- TypeScript types updated for v7 APIs
- Component functionality verified

**Success Criteria**:
- [x] All @mantine packages at v7.x
- [x] No v6 API usage remaining
- [x] No deprecation warnings in compilation
- [x] Visual appearance identical to pre-migration
- [x] Component functionality verified
- [x] Development build succeeds
- [x] Production build succeeds

**Hands-off to Build & Test**:
- All code updated to TypeScript
- All dependencies latest versions
- All components using Mantine v7
- All unit tests passed (visual verification)
- Ready for comprehensive build and deployment verification

---

## Unit Dependencies and Sequencing

### Dependency Diagram

```
┌─────────────────────────────────────────────┐
│ Unit 1: Dependencies & Configuration        │
│ - Update npm packages                       │
│ - Create tsconfig.json                      │
│ - Configure build system                    │
│ - Resolve peer dependencies                 │
└─────────────────────────────────────────────┘
                      ↓
         [Provides TypeScript tooling]
         [Provides build configuration]
                      ↓
┌─────────────────────────────────────────────┐
│ Unit 2: TypeScript Conversion               │
│ - Convert 52 files to TypeScript            │
│ - Add type definitions                      │
│ - Resolve compilation errors                │
│ - Enable strict mode                        │
└─────────────────────────────────────────────┘
                      ↓
         [Provides type-safe codebase]
         [Provides proper typing]
                      ↓
┌─────────────────────────────────────────────┐
│ Unit 3: Mantine v7 Migration                │
│ - Update Mantine components to v7 API       │
│ - Verify visual appearance                  │
│ - Test all component functionality          │
│ - Ensure no v6 APIs remain                  │
└─────────────────────────────────────────────┘
                      ↓
         [Provides modernized codebase]
         [All updates complete]
                      ↓
┌─────────────────────────────────────────────┐
│ Build and Test (Final Verification)         │
│ - Comprehensive visual testing              │
│ - Build verification                        │
│ - Deployment verification                   │
└─────────────────────────────────────────────┘
```

### Critical Coordination Points

**Unit 1 → Unit 2**:
- [ ] Unit 1 must have clean npm install (no --legacy-peer-deps)
- [ ] tsconfig.json must be created and valid
- [ ] TypeScript compiler must be installed and functional
- [ ] Build system updated for .ts/.tsx files
- [ ] Development server must start successfully

**Unit 2 → Unit 3**:
- [ ] All 52 files converted to TypeScript
- [ ] Zero TypeScript compilation errors
- [ ] Strict mode enabled and enforced
- [ ] Type coverage > 95%
- [ ] Development server running with TypeScript
- [ ] All file imports properly typed

**Unit 3 → Build & Test**:
- [ ] All Mantine v7 APIs implemented
- [ ] No deprecated v6 APIs in codebase
- [ ] Visual appearance verified
- [ ] Component functionality tested
- [ ] Production build successful

---

## Planning Checkpoints

- [ ] **Step 1**: Confirm unit definitions and scope
- [ ] **Step 2**: Identify any additional clarifying questions needed
- [ ] **Step 3**: Generate mandatory unit artifacts (unit-of-work.md, dependencies, story-map)
- [ ] **Step 4**: Validate unit boundaries
- [ ] **Step 5**: Ensure no requirements gaps

---

## Clarifying Questions

Based on the execution plan and project context, the following clarification is needed:

### Question 1: Unit 2 Conversion Sequence
**Context**: Unit 2 involves converting 52 files to TypeScript. Different conversion sequences have different risks and benefits.

**Options**:
- **A**: Bottom-up (services → utilities → components) - Lower risk, easier to catch type errors early, more work upfront
- **B**: Top-down (components → utilities → services) - Higher risk of cascading issues, but can catch integration issues early
- **C**: Parallel batches (convert all layers in parallel sprints) - Complex to coordinate, but parallel progress

**Question**: Which conversion sequence would you prefer?

[Answer]: A

---

### Question 2: Bundle Size and Tree-Shaking
**Context**: Unit 3 (Mantine v7 migration) may increase bundle size. The execution plan mentions monitoring but needs a success threshold.

**Options**:
- **A**: Strict limit - Bundle size must not exceed current size (0% increase)
- **B**: Acceptable increase - Allow up to 10% increase (current ~80KB → acceptable ~88KB)
- **C**: Performance-based - Allow any increase if load time < current + 10%
- **D**: No specific target - Monitor and optimize if needed during testing

**Question**: What bundle size threshold should trigger optimization efforts?

[Answer]: D

---

### Question 3: TypeScript Strict Mode Enforcement
**Context**: TypeScript strict mode catches more issues but requires more careful typing. Some teams use `strict: true` while others use selective strict flags.

**Options**:
- **A**: Full strict mode enabled (strict: true in tsconfig.json)
- **B**: Selective strict flags (noImplicitAny: true, strictNullChecks: true, etc.)
- **C**: Gradual adoption (enable strict: false initially, then enable per-file)

**Question**: Should we use full strict mode or selective flags for TypeScript configuration?

[Answer]: A

---

### Question 4: Component Testing During Unit 3
**Context**: Unit 3 involves Mantine v7 migration with visual verification. The scope of testing needs clarification.

**Options**:
- **A**: Comprehensive - Test every component in all possible states and variants
- **B**: Core flows only - Test only the 5 core user flows (search, cart, checkout, etc.)
- **C**: Critical components - Focus on components that changed significantly in v7
- **D**: Visual regression only - Compare before/after screenshots for visual changes

**Question**: What scope of testing should Unit 3 include for Mantine v7 components?

[Answer]: D

---

## Unit Integration Points

### Data Flow Between Units

**Unit 1 → Unit 2**:
- Configuration artifacts (tsconfig.json, build settings)
- TypeScript compiler and tooling
- Dependency versions locked in package-lock.json

**Unit 2 → Unit 3**:
- Type-safe components (all .tsx with proper typing)
- Service types and interfaces
- Dependency versions (now with TypeScript support)
- Type definitions for Mantine v6 API

**Unit 3 → Build & Test**:
- Final component code (all with v7 API)
- Type definitions updated for v7
- No breaking changes remaining
- Build-ready codebase

### Testing Coordination

**Unit 1 Testing**:
- npm install verification (clean, no warnings)
- Build system verification (development + production)
- TypeScript compiler verification

**Unit 2 Testing**:
- TypeScript compilation (zero errors)
- Type coverage verification
- Development server verification

**Unit 3 Testing**:
- Visual spot checks after each component migration
- Component functionality verification
- API integration testing

**Build & Test**:
- Comprehensive visual testing (5 core flows)
- Build and deployment verification
- Performance verification
- Final acceptance

---

## Risks and Mitigations

### Per-Unit Risk Assessment

**Unit 1 Risks**:
- Risk: Peer dependency conflicts cannot be fully resolved
- Mitigation: Research compatibility matrix, use npm overrides if needed

**Unit 2 Risks**:
- Risk: TypeScript conversion introduces subtle bugs
- Mitigation: Strict mode catches most issues, incremental testing

**Unit 3 Risks**:
- Risk: Mantine v7 breaking changes more extensive than expected
- Mitigation: Thorough analysis of migration guide, component-by-component approach

---

## Generation Plan Steps

Once approved, Units Generation (Part 2) will execute these steps:

- [ ] **Step 1**: Generate `unit-of-work.md`
  - Unit definitions with responsibilities
  - Scope and boundaries for each unit
  - Success criteria and deliverables

- [ ] **Step 2**: Generate `unit-of-work-dependency.md`
  - Dependency matrix between units
  - Interaction points and data flow
  - Coordination requirements

- [ ] **Step 3**: Generate `unit-of-work-story-map.md`
  - Map requirements to units
  - Assign tasks to units
  - Timeline estimates per unit

- [ ] **Step 4**: Validate unit artifacts
  - Ensure no requirements gaps
  - Verify dependencies are correct
  - Confirm all components are assigned

- [ ] **Step 5**: Update progress tracking
  - Mark Units Generation complete in aidlc-state.md
  - Document unit decomposition decision

---

## Next Steps

### Immediate (Upon Approval)
1. Fill in answers to clarifying questions (4 questions above)
2. Confirm unit decomposition approach
3. Mark for Units Generation Part 2

### Units Generation Part 2
1. Generate unit-of-work.md with detailed unit definitions
2. Generate unit-of-work-dependency.md with interaction matrix
3. Generate unit-of-work-story-map.md with requirement mappings

### CONSTRUCTION PHASE
1. Execute Unit 1: Dependency Updates & Configuration
   - NFR Requirements → NFR Design → Code Planning → Code Generation
2. Execute Unit 2: TypeScript Conversion
   - NFR Requirements → NFR Design → Code Planning → Code Generation
3. Execute Unit 3: Mantine v7 Migration
   - NFR Requirements → NFR Design → Code Planning → Code Generation
4. Execute Build and Test (comprehensive verification)

---

**Document Version**: 1.0  
**Created**: 2026-03-09
