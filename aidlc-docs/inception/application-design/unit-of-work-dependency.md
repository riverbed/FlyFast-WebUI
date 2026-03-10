# Unit of Work Dependency Matrix

## Overview

This document maps the dependencies, data flows, and interaction points between the 3 units of work for the FlyFast-WebUI modernization project. Understanding these dependencies is critical for successful sequential execution.

---

## Dependency Matrix

### Unit Interactions

```
┌────────────────────────────────────────────────────────┐
│ DEPENDENCY MATRIX - FlyFast-WebUI Modernization       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Unit 1: Dependencies & Config                        │
│  ├─ Provides: tsconfig.json, typed build system       │
│  ├─ Provides: Updated npm dependencies                │
│  ├─ Blocks: Unit 2 (requires typed build system)      │
│  └─ Required by: Unit 2, Unit 3                       │
│           ↓                                            │
│  Unit 2: TypeScript Conversion                        │
│  ├─ Requires: Unit 1 (typed build system)             │
│  ├─ Provides: Typed codebase, component types         │
│  ├─ Blocks: Unit 3 (requires typed components)        │
│  └─ Required by: Unit 3, Build & Test                 │
│           ↓                                            │
│  Unit 3: Mantine v7 Migration                         │
│  ├─ Requires: Unit 2 (TypeScript components)          │
│  ├─ Provides: Modernized component library            │
│  ├─ No blocking dependencies                          │
│  └─ Required by: Build & Test (final verification)    │
│           ↓                                            │
│  Build & Test: Final Verification                     │
│  ├─ Requires: Units 1, 2, 3 (all complete)            │
│  └─ Provides: Verified, deployable codebase           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Critical Path Analysis

**Critical Path**: Unit 1 → Unit 2 → Unit 3 → Build & Test

**No Parallelization Possible**: All dependencies are serial (each unit output feeds into next unit input)

**Critical Path Duration**: 14-20 hours (sum of all unit durations)

---

## Detailed Dependency Specifications

### Unit 1 → Unit 2 Dependency

**Unit 1 Must Provide**:
- tsconfig.json (React configuration with strict: true)
- Updated package.json (all 22 dependencies latest)
- Updated package-lock.json (clean dependency tree)
- Build system configuration for TypeScript
- Verified npm install (no --legacy-peer-deps)

**Unit 2 Dependencies**:
- TypeScript compiler (installed in Unit 1)
- Build system configured for .ts/.tsx
- React-scripts or equivalent TypeScript support
- Development server with TypeScript support
- Production build with TypeScript compilation

**Verification Gate**: Unit 1 must pass before Unit 2 starts
- [ ] npm install clean (no warnings)
- [ ] TypeScript compiles empty project
- [ ] Development server starts
- [ ] Production build succeeds

**Handoff Artifact**: 
```
package.json (updated)
package-lock.json (clean)
tsconfig.json (new)
Build configuration (updated)
node_modules/ (clean install)
```

---

### Unit 2 → Unit 3 Dependency

**Unit 2 Must Provide**:
- All 52 files converted to TypeScript (.ts/.tsx)
- Type definitions for all components, services, utilities
- API response types (Flight, Airport, Seat, Trip, Cart items)
- Component prop interfaces
- Service function signatures
- Zero TypeScript compilation errors

**Unit 3 Dependencies**:
- Type-safe components ready for API migration
- Service modules with proper typing
- Type definitions for Mantine v6 API
- Utilities with proper function signatures
- No JavaScript files remaining

**Verification Gate**: Unit 2 must pass before Unit 3 starts
- [ ] All 52 files are .ts or .tsx
- [ ] Zero TypeScript compilation errors
- [ ] Type coverage > 95%
- [ ] Development server runs with TypeScript
- [ ] No implicit 'any' types

**Handoff Artifact**:
```
src/
├─ components/**/*.tsx (all typed)
├─ pages/**/*.tsx (all typed)
├─ services/**/*.ts (all typed)
├─ types/ (new type definitions)
│  ├─ api.ts (Flight, Airport, etc.)
│  ├─ context.ts (Cart state)
│  ├─ components.ts (prop interfaces)
│  └─ index.ts (exports)
└─ [all other files converted]
```

---

### Unit 3 → Build & Test Dependency

**Unit 3 Must Provide**:
- All components updated to Mantine v7 API
- No deprecated Mantine v6 API usage remaining
- Visual appearance identical to pre-migration
- Component functionality verified
- All imports updated to v7 packages

**Build & Test Dependencies**:
- Modernized codebase (all 3 units complete)
- All dependencies latest versions (Unit 1)
- All files TypeScript typed (Unit 2)
- All components using v7 API (Unit 3)
- No breaking changes remaining

**Verification Gate**: Unit 3 must pass before Build & Test starts
- [ ] All @mantine/* packages at v7.x
- [ ] No @mantine/v6 imports
- [ ] No deprecation warnings
- [ ] Visual spot checks pass
- [ ] Development build succeeds

**Handoff Artifact**:
```
src/
├─ components/**/*.tsx (all v7 API)
├─ pages/**/*.tsx (all v7 API)
├─ services/**/*.ts (unchanged, but typed)
└─ [all files updated and tested]

package.json (latest deps)
package-lock.json (clean)
tsconfig.json (strict mode)
Dockerfile (updated if needed)
```

---

## Data Flow Between Units

### Configuration and Build System Flow

```
UNIT 1 OUTPUT
├─ package.json (latest deps)
├─ package-lock.json (clean tree)
├─ tsconfig.json (strict: true)
└─ Build config updates
     ↓
UNIT 2 INPUT
├─ TypeScript compiler (from Unit 1)
├─ Build system for .ts/.tsx (from Unit 1)
├─ Dependencies locked (from Unit 1)
└─ Development environment ready
     ↑ (USED BY)
UNIT 2 PROCESS (Converts to TS, adds types)
└─ OUTPUT: Type definitions, .ts/.tsx files
     ↓
UNIT 3 INPUT
├─ Typed components (from Unit 2)
├─ Type definitions (from Unit 2)
├─ Service types (from Unit 2)
└─ Build system ready (from Unit 1)
     ↑ (USED BY)
UNIT 3 PROCESS (Updates to Mantine v7)
└─ OUTPUT: v7 API compliance, visual parity
     ↓
BUILD & TEST INPUT
├─ All units complete (1, 2, 3)
├─ Modernized codebase
├─ Typed and tested
└─ Ready for final verification
```

---

## Coordination Points and Handoffs

### Handoff #1: Unit 1 → Unit 2

**When**: Unit 1 all completion criteria met
**Who**: Unit 1 lead hands off to Unit 2 lead
**What**: Build configuration, dependencies, TypeScript setup
**How**: Review checklist, verify builds work
**Rollback**: If Unit 2 can't start, Unit 1 may need adjustment

**Pre-Handoff Verification**:
```
✓ npm install clean (no legacy flag needed)
✓ TypeScript compiler available
✓ tsconfig.json with strict: true
✓ Development server starts
✓ Production build succeeds
✓ No build warnings
✓ package-lock.json clean
```

---

### Handoff #2: Unit 2 → Unit 3

**When**: Unit 2 all completion criteria met
**Who**: Unit 2 lead hands off to Unit 3 lead
**What**: Typed codebase, type definitions, .ts/.tsx files
**How**: Code review, TypeScript check, spot test components
**Rollback**: If Unit 3 encounters type issues, may cycle back to Unit 2

**Pre-Handoff Verification**:
```
✓ All 52 files converted (.ts/.tsx)
✓ Zero TypeScript compilation errors
✓ Strict mode working (strict: true)
✓ Type coverage > 95%
✓ All services have signatures
✓ All components have prop types
✓ No implicit 'any' types
✓ Development server runs
✓ Production build succeeds
```

---

### Handoff #3: Unit 3 → Build & Test

**When**: Unit 3 all completion criteria met
**Who**: Unit 3 lead hands off to Build & Test lead
**What**: Modernized, typed, v7-compliant codebase
**How**: Visual verification, build testing, deployment testing
**Rollback**: If issues found, may cycle back to Unit 3

**Pre-Handoff Verification**:
```
✓ All @mantine/* at v7.x
✓ No @mantine/v6 imports
✓ No deprecation warnings
✓ Component functionality verified
✓ Visual regression tests pass
✓ Development build succeeds
✓ Production build succeeds
```

---

## Dependency Conflicts and Resolutions

### Potential Conflicts

**Conflict 1**: Unit 2 component types don't match Unit 3 Mantine v7 types
- **Resolution**: Create adapter types during Unit 2 or update during Unit 3
- **Prevention**: Ensure Unit 2 types are not tied to specific v6 APIs

**Conflict 2**: Unit 1 dependency versions incompatible with Unit 2 TypeScript
- **Resolution**: Adjust dependency versions in Unit 1 before proceeding to Unit 2
- **Prevention**: Test TypeScript with dependencies before moving forward

**Conflict 3**: Unit 3 Mantine v7 API incompatible with Unit 2 types
- **Resolution**: Update type definitions during Unit 3 for v7 compatibility
- **Prevention**: Keep Unit 2 types generic, don't hardcode v6 assumptions

### Conflict Prevention Strategies

1. **Type Abstraction**: Keep types generic (don't assume specific Mantine version)
2. **API Compatibility**: Design services to be version-agnostic
3. **Testing Checkpoints**: Verify each handoff criteria before proceeding
4. **Documentation**: Document assumptions and dependencies clearly
5. **Reversibility**: Keep git history for potential rollbacks

---

## Integration Testing Strategy

### Unit 1 Integration Testing

**Test Scope**: Build system and dependencies
- [ ] npm install runs cleanly
- [ ] TypeScript compiler works with configuration
- [ ] Development server starts
- [ ] Production build succeeds
- [ ] No build warnings

---

### Unit 2 Integration Testing

**Test Scope**: Type-safe codebase
- [ ] TypeScript compilation succeeds
- [ ] No type errors or implicit 'any'
- [ ] Components build and render
- [ ] Services work correctly
- [ ] Type coverage > 95%

**Integration Points**:
- Verify Unit 1 dependencies are not broken by Unit 2
- Ensure Unit 2 types work with build system from Unit 1

---

### Unit 3 Integration Testing

**Test Scope**: Mantine v7 migration
- [ ] All components render with v7 API
- [ ] Component functionality unchanged
- [ ] Visual appearance matches pre-migration
- [ ] No console errors
- [ ] Build succeeds with v7 dependencies

**Integration Points**:
- Verify Unit 2 types work with Unit 3 v7 API
- Ensure Unit 3 components build successfully
- Verify no regressions from Unit 1 or Unit 2

---

### End-to-End Integration Testing

**Final Verification**: All 3 units working together
- [ ] Development environment fully functional
- [ ] Production build succeeds
- [ ] Docker build succeeds
- [ ] All 5 core user flows work
- [ ] Visual appearance preserved
- [ ] Performance acceptable
- [ ] No console errors or warnings

---

## Deployment and Rollback Considerations

### Deployment Order

**Forward Deployment**:
1. Commit Unit 1 changes (dependencies, tsconfig, build config)
2. Commit Unit 2 changes (TypeScript conversion, types)
3. Commit Unit 3 changes (Mantine v7 migration)
4. Final build and deployment

**Atomic Units**: Each unit should be committable independently
- Unit 1 commit: Clean build state, all dependencies updated
- Unit 2 commit: Type-safe codebase, all TypeScript working
- Unit 3 commit: Mantine v7 compliant, visual verification passed

### Rollback Strategy

**If Unit 1 fails**:
- Rollback package.json to previous version
- Rollback tsconfig to working state
- Clean node_modules and reinstall

**If Unit 2 fails**:
- Rollback all .ts/.tsx conversions
- Remove custom type definitions
- Revert to Unit 1 completion state

**If Unit 3 fails**:
- Revert component code to pre-v7 updates
- Keep TypeScript types intact
- Revert to Unit 2 completion state

**If final testing fails**:
- Cycle back to failing unit
- Fix issues while keeping prior units' progress
- Re-test from that point forward

---

## Dependency Summary Table

| Dependency | From Unit | To Unit | What | Critical | Rollback |
|-----------|-----------|---------|------|----------|----------|
| tsconfig.json | Unit 1 | Unit 2 | TS config | Yes | Regenerate |
| Dependencies | Unit 1 | Unit 2,3 | npm packages | Yes | npm install old |
| Build config | Unit 1 | Unit 2,3 | .ts/.tsx support | Yes | Revert config |
| Type defs | Unit 2 | Unit 3 | Component types | Yes | Regenerate |
| .ts/.tsx files | Unit 2 | Unit 3 | Source code | Yes | Revert commit |
| Mantine v7 | Unit 3 | Build&Test | Component library | Yes | npm downgrade |

---

**Document Version**: 1.0  
**Created**: 2026-03-09
