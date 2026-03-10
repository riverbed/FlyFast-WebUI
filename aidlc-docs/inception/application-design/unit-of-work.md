# Unit of Work Definition

## Overview

This document defines the 3 units of work for the FlyFast-WebUI modernization project. Each unit is a logical grouping of development tasks that can be executed sequentially, with clear responsibilities, deliverables, and success criteria.

**Total Units**: 3  
**Execution Model**: Sequential (each unit builds on the previous)  
**Total Scope**: 52 source files, 22 dependencies, complete codebase modernization

---

## Unit 1: Dependency Updates & Configuration

### Unit Identifier
- **ID**: UNIT-001
- **Name**: Dependency Updates & Configuration
- **Phase**: CONSTRUCTION Phase - Unit 1
- **Sequence**: First (Foundation for Units 2 & 3)

### Purpose
Establish the technical foundation for TypeScript development by updating all dependencies to their latest versions, resolving peer dependency conflicts, and configuring the build system for TypeScript support.

### Scope

**In Scope**:
- Update all 22 direct npm dependencies to latest stable versions
- Resolve peer dependency conflicts (eliminate --legacy-peer-deps)
- Create TypeScript configuration (tsconfig.json) with strict mode
- Update build configuration for TypeScript compilation
- Update Dockerfile base image version if needed
- Regenerate package-lock.json

**Out of Scope**:
- Converting JavaScript to TypeScript (Unit 2 responsibility)
- Implementing Mantine v7 API changes (Unit 3 responsibility)
- Code refactoring beyond config updates

### Key Components
- **package.json**: Update all 22 dependencies
- **package-lock.json**: Regenerate with resolved conflicts
- **tsconfig.json**: New TypeScript configuration (create)
- **Dockerfile**: Update Node.js base image if needed
- **Build configuration**: Update for TypeScript support

### Dependencies
- **Upstream**: None (foundation unit)
- **Downstream**: Unit 2 (requires typed build system), Unit 3 (requires updated deps)

### Success Criteria

- [x] All production dependencies updated to latest stable versions
- [x] All development dependencies updated to latest stable versions
- [x] npm install works without --legacy-peer-deps flag
- [x] No peer dependency warnings during installation
- [x] tsconfig.json created with `strict: true`
- [x] TypeScript compiler installed and functional
- [x] Development server starts without errors
- [x] Production build completes successfully
- [x] Docker build completes successfully
- [x] Dependency tree clean and valid

### Deliverables

1. **Updated package.json**
   - All 22 dependencies at latest versions
   - No --legacy-peer-deps workarounds
   - TypeScript devDependency configured

2. **Updated package-lock.json**
   - Clean dependency tree
   - All transitive dependencies resolved
   - No duplicate dependencies

3. **New tsconfig.json**
   - React configuration
   - Strict mode: true
   - Module: esnext
   - JSX: react-jsx
   - Target: es2020
   - Lib: es2020, dom, dom.iterable

4. **Updated build configuration**
   - Build scripts updated if needed
   - React-scripts configured for TypeScript
   - Webpack/Babel working with TypeScript

5. **Updated Dockerfile** (if needed)
   - Latest compatible Node.js LTS
   - Multi-stage build working
   - npm install without legacy flag

### Technical Considerations

**Peer Dependency Conflicts**:
- Research compatibility matrix for all 22 dependencies
- Test each update for compatibility
- Document any overrides in package.json
- Verify lock file is clean

**TypeScript Configuration**:
- Use strict mode for maximum type safety
- Configure for React 18.3.1
- Enable all strict checks (noImplicitAny, strictNullChecks, etc.)
- Set proper module resolution

**Build System**:
- Verify react-scripts version compatibility
- Test development server with TypeScript
- Test production build with TypeScript
- Ensure build performance acceptable

### Team Responsibilities

- **TypeScript Configuration**: Configure tsconfig.json with strict mode
- **Dependency Updates**: Update package.json with latest versions
- **Conflict Resolution**: Identify and resolve peer dependency conflicts
- **Verification**: Test clean install and builds

### Risks

- **Risk**: Peer dependency conflicts cannot be resolved
  - **Severity**: High
  - **Mitigation**: Research compatibility, consider version alternatives, use npm overrides if necessary
  
- **Risk**: TypeScript compiler incompatible with build system
  - **Severity**: Medium
  - **Mitigation**: Test TypeScript with react-scripts version, update scripts if needed

### Estimated Effort
- **Duration**: 2-3 hours
- **Breakdown**:
  - Dependency research and updates: 1 hour
  - Peer dependency resolution: 1 hour
  - TypeScript configuration: 30 minutes
  - Build system verification: 30 minutes

---

## Unit 2: TypeScript Conversion

### Unit Identifier
- **ID**: UNIT-002
- **Name**: TypeScript Conversion
- **Phase**: CONSTRUCTION Phase - Unit 2
- **Sequence**: Second (Requires Unit 1)

### Purpose
Migrate entire JavaScript codebase to TypeScript with strict type checking, ensuring type safety across all components and services while maintaining existing functionality.

### Scope

**In Scope**:
- Convert all 23 React components (.js → .tsx)
- Convert all 6 service modules (.js → .ts)
- Convert all utility functions (.js → .ts)
- Convert entry points (index.js, App.js → .ts)
- Create type definitions for all APIs and data structures
- Update imports to utilize TypeScript types
- Resolve all TypeScript compilation errors

**Out of Scope**:
- Updating dependency versions (Unit 1 responsibility)
- Implementing Mantine v7 API changes (Unit 3 responsibility)
- Adding new features or refactoring beyond type implementation

### Key Components

**React Components** (23 files):
- Pages: Home.js, SearchFlight.js, Checkout.js
- Layout: ApplicationContainer.js, ApplicationHeader.js
- Feature: Search.js, SearchResults.js, Results.js, NoResults.js, TripCard.js, Flight.js, Cart.js, EmptyCart.js, Confirmation.js, Cost.js, Username.js, etc.

**Services** (6 files):
- Context.js → Context.tsx (state management)
- Flight.js → Flight.ts (API client)
- Tracing.js → Tracing.ts (OpenTelemetry setup)
- CustomTracing.js → CustomTracing.ts (custom tracing)
- Functions.js → Functions.ts (utilities)
- AirportInformation.js → AirportInformation.ts

**Entry Points** (5 files):
- index.js → index.ts
- App.js → App.tsx
- setupProxy.js → setupProxy.ts
- setupTests.js → setupTests.ts
- reportWebVitals.js → reportWebVitals.ts

**Type Definitions** (new files):
- types/api.ts (Flight, Airport types)
- types/context.ts (Cart, search state types)
- types/components.ts (component props)
- types/index.ts (re-exports)

### Dependencies
- **Upstream**: Unit 1 (requires TypeScript config, updated deps)
- **Downstream**: Unit 3 (provides typed codebase)

### Success Criteria

- [x] All 52 files converted to TypeScript (.ts/.tsx)
- [x] TypeScript compiles without errors
- [x] Strict mode enabled and enforced (strict: true)
- [x] No implicit 'any' types
- [x] Type coverage > 95%
- [x] All component props properly typed
- [x] All API responses have types
- [x] All service functions have signatures
- [x] Development server runs successfully
- [x] Production build succeeds

### Deliverables

1. **Converted Components**
   - All 23 .tsx files with proper prop types
   - All component props interfaces defined
   - All useState/useContext hooks typed

2. **Converted Services**
   - All 6 .ts files with function signatures
   - All API response types defined
   - All utility function types defined

3. **Type Definitions**
   - types/api.ts - Flight, Airport, Seat, Trip types
   - types/context.ts - CartContext, Cart item types
   - types/components.ts - Common component props
   - types/index.ts - Re-exports

4. **Updated Entry Points**
   - index.ts with proper bootstrap typing
   - App.tsx with route types
   - Configuration files converted

5. **Zero Compilation Errors**
   - TypeScript check passes
   - ESLint passes for TypeScript files
   - No type errors or warnings

### Conversion Strategy

**Conversion Sequence**: Bottom-up (services → utilities → components)
- **Phase 1**: Convert services (Context, Flight, Tracing) with full type definitions
- **Phase 2**: Convert utilities (Functions, AirportInformation) with proper signatures
- **Phase 3**: Convert components (bottom-up through component hierarchy)
- **Phase 4**: Convert entry points and fix imports

**Type Definition Approach**:
- Define API response types first (Flight, Airport, etc.)
- Define component prop interfaces as components are converted
- Use generics for reusable types
- Create a types/ directory for centralized type definitions

### Technical Considerations

**Type Safety**:
- Enable strict mode for maximum type safety
- Use discriminated unions for complex types
- Implement proper Error types
- Type async operations (Promise, async/await)

**Configuration**:
- tsconfig.json with strict: true
- Proper module resolution
- Source maps for debugging
- Include declaration files if needed

**Testing During Conversion**:
- Compile after each service conversion
- Verify development server after each batch
- Check bundle size impact
- Spot-check UI components after conversion

### Team Responsibilities

- **Service Conversion**: Convert all 6 services with types
- **Type Definition Creation**: Define API and component types
- **Component Conversion**: Convert 23 components top-down through hierarchy
- **Error Resolution**: Fix all TypeScript errors
- **Verification**: Ensure zero compilation errors

### Risks

- **Risk**: TypeScript conversion introduces subtle bugs
  - **Severity**: High
  - **Mitigation**: Strict mode catches most issues, incremental testing, visual verification
  
- **Risk**: Type definitions incomplete or incorrect
  - **Severity**: Medium
  - **Mitigation**: Test all code paths, type coverage > 95%

### Estimated Effort
- **Duration**: 6-8 hours
- **Breakdown**:
  - Service conversion + types: 2 hours
  - Utility conversion + types: 1 hour
  - Component conversion + types: 4-5 hours
  - Error resolution: 1-2 hours

---

## Unit 3: Mantine v7 Migration

### Unit Identifier
- **ID**: UNIT-003
- **Name**: Mantine v7 Migration
- **Phase**: CONSTRUCTION Phase - Unit 3
- **Sequence**: Third (Requires Units 1 & 2)

### Purpose
Migrate all Mantine UI components from v6 API to v7 API, ensuring visual parity and component functionality while leveraging TypeScript types for improved developer experience.

### Scope

**In Scope**:
- Update all Mantine component usage to v7 API
- Update Mantine hooks (useLocalStorage) to v7 API
- Update styling if breaking changes from v6→v7
- Update component imports (@mantine/core, @mantine/dates, @mantine/hooks)
- Verify visual appearance and functionality
- Update TypeScript types for v7 APIs

**Out of Scope**:
- Updating dependencies (Unit 1 responsibility)
- Converting to TypeScript (Unit 2 responsibility)
- Adding new features or components

### Key Components

**Mantine Components Used**:
- **@mantine/core**: Grid, Group, Paper, Button, LoadingOverlay, TextInput, Select, etc.
- **@mantine/dates**: DatePickerInput
- **@mantine/hooks**: useLocalStorage

**Components to Migrate**:
- **Search.tsx**: Autocomplete, NativeSelect, DatePickerInput, Grid, Group
- **ApplicationContainer.tsx**: Cart management
- **SearchResults.tsx**: Results display
- **TripCard.tsx**: Flight card display
- **Cart.tsx**: Cart display, EmptyCart
- **Checkout.tsx**: Checkout form
- **App.tsx**: LoadingOverlay
- **Context.tsx**: useLocalStorage hook

### Dependencies
- **Upstream**: Unit 2 (requires TypeScript codebase)
- **Downstream**: Build & Test (final verification)

### Success Criteria

- [x] All @mantine packages upgraded to v7.x
- [x] All Mantine components updated to v7 API
- [x] No v6 API imports remaining
- [x] No deprecation warnings
- [x] Visual appearance identical to pre-migration
- [x] Component functionality verified
- [x] All TypeScript types for v7
- [x] Development build succeeds
- [x] Production build succeeds

### Deliverables

1. **Updated Components**
   - All components using v7 Mantine API
   - No v6 imports (from @mantine/*)
   - TypeScript types for v7 components

2. **Updated Hooks**
   - useLocalStorage hook updated to v7 API
   - Proper typing for hooks

3. **Updated Styling** (if needed)
   - CSS updated for v7 style changes
   - Theme configuration updated if needed

4. **Breaking Changes Addressed**
   - Component prop changes implemented
   - API changes addressed
   - Renamed components updated

5. **Verified Functionality**
   - All components render correctly
   - All interactions work as before
   - No console errors

### Migration Strategy

**Testing Approach**: Visual regression testing (before/after screenshots)
- **Phase 1**: Analyze Mantine v6→v7 migration guide
- **Phase 2**: Update components in dependency order
- **Phase 3**: Test components with visual verification
- **Phase 4**: Verify all core flows work

**Component Update Order**:
1. Hook updates (useLocalStorage in Context.tsx)
2. Low-level components (Button, TextInput, etc.)
3. Layout components (Grid, Group, Paper)
4. Complex components (Search, Cart, Results)
5. Page components (App.tsx, all pages)

### Technical Considerations

**Breaking Changes**:
- Research Mantine v6→v7 migration guide thoroughly
- Document all component API changes
- Create migration checklist for all components
- Test each change for visual regression

**Bundle Size**:
- Monitor bundle size during migration
- Use code splitting effectively
- Optimize imports from @mantine/core
- Goal: Monitor and optimize if needed (no hard limit)

**Type Updates**:
- Update component type definitions for v7
- Update hook types for v7 API
- Ensure TypeScript catches breaking changes

### Team Responsibilities

- **Migration Guide Analysis**: Document all v6→v7 changes
- **Component Migration**: Update all components to v7 API
- **Visual Testing**: Verify visual appearance before/after
- **Functionality Testing**: Verify all interactions work
- **Build Verification**: Ensure builds succeed

### Risks

- **Risk**: Mantine v7 breaking changes more extensive than expected
  - **Severity**: High
  - **Mitigation**: Thorough analysis of migration guide, incremental migration approach
  
- **Risk**: Visual regressions not caught until late
  - **Severity**: High
  - **Mitigation**: Visual verification after each component, comprehensive testing before final

### Estimated Effort
- **Duration**: 4-6 hours
- **Breakdown**:
  - Migration guide analysis: 1 hour
  - Component updates: 3-4 hours
  - Visual verification: 1 hour

---

## Unit Handoff and Coordination

### Unit 1 → Unit 2 Handoff

**Unit 1 Completion Verification**:
- [x] npm install works without --legacy-peer-deps
- [x] All 22 dependencies updated
- [x] tsconfig.json created with strict: true
- [x] TypeScript compiler installed and functional
- [x] Development server starts
- [x] Production build succeeds

**Unit 2 Readiness**:
- [x] TypeScript tooling ready
- [x] Build system configured for .ts/.tsx
- [x] IDE tooling functional
- [x] All dependencies locked in package-lock.json

**Handoff Artifact**: `package-lock.json`, `tsconfig.json`, updated build configuration

---

### Unit 2 → Unit 3 Handoff

**Unit 2 Completion Verification**:
- [x] All 52 files converted to TypeScript
- [x] Zero TypeScript compilation errors
- [x] Strict mode enabled and enforced
- [x] Type coverage > 95%
- [x] Development server runs with TypeScript
- [x] Production build succeeds

**Unit 3 Readiness**:
- [x] Type-safe codebase ready for API migration
- [x] All components have proper typing
- [x] Services have proper type signatures
- [x] Ready for Mantine v7 API updates

**Handoff Artifact**: All .ts/.tsx files with types, complete type definitions

---

### Unit 3 → Build & Test Handoff

**Unit 3 Completion Verification**:
- [x] All Mantine v7 APIs implemented
- [x] No deprecated v6 APIs remaining
- [x] Visual appearance verified
- [x] Component functionality verified
- [x] Development build succeeds
- [x] Production build succeeds

**Build & Test Readiness**:
- [x] All code updated and compiled
- [x] No breaking changes remaining
- [x] Ready for comprehensive testing
- [x] Ready for deployment verification

**Handoff Artifact**: All source code converted, tested, and ready for final build/deployment

---

## Summary

| Unit | Name | Scope | Duration | Sequence | Dependencies |
|------|------|-------|----------|----------|--------------|
| 1 | Dependencies & Config | 22 deps, tsconfig, build config | 2-3h | First (Foundation) | None |
| 2 | TypeScript Conversion | 52 files, type definitions | 6-8h | Second (Requires Unit 1) | Unit 1 |
| 3 | Mantine v7 Migration | All components, hooks, APIs | 4-6h | Third (Requires Unit 2) | Unit 2 |
| - | Build & Test | Full verification | 2-3h | Final | Unit 3 |

**Total Estimated Duration**: 14-20 hours of development time

**Execution Style**: Sequential (each unit builds on previous)

**Risk Level**: Medium-High (mitigated by incremental approach and checkpoints)

---

**Document Version**: 1.0  
**Created**: 2026-03-09
