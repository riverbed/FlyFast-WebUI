# Unit of Work Story Map

## Overview

This document maps all requirements, functional specifications, and implementation tasks to their respective units of work. Each requirement is traced to the unit (or units) responsible for implementing it.

---

## Requirements to Unit Mapping

### FR-1: Dependency Updates

**Requirement**: Update all npm dependencies to their latest available versions

**Unit Assignment**: **UNIT-001** (Dependency Updates & Configuration)

**Tasks**:
- [ ] Research latest stable versions for all 22 dependencies
- [ ] Update package.json with new versions
- [ ] Verify compatibility across dependencies
- [ ] Run npm install to generate package-lock.json
- [ ] Verify clean install (no --legacy-peer-deps needed)

**Deliverables**:
- Updated package.json
- New package-lock.json
- All dependencies at latest versions

**Success Criteria**:
- [x] All dependencies updated
- [x] package-lock.json regenerated
- [x] npm install clean

---

### FR-2: Mantine UI Framework Migration

**Requirement**: Upgrade Mantine UI from v6.0.18 to v7.x with full migration

**Unit Assignments**: 
- **UNIT-001**: Update Mantine packages in package.json
- **UNIT-003**: Migrate components to Mantine v7 API

**Tasks for UNIT-001**:
- [ ] Update @mantine/core to v7.x
- [ ] Update @mantine/dates to v7.x
- [ ] Update @mantine/hooks to v7.x
- [ ] Verify peer dependencies satisfied

**Tasks for UNIT-003**:
- [ ] Analyze Mantine v6→v7 migration guide
- [ ] Document all breaking changes
- [ ] Update Autocomplete usage (Search component)
- [ ] Update NativeSelect usage (Search component)
- [ ] Update DatePickerInput usage (Search component)
- [ ] Update Grid, Group, Paper usage (layout components)
- [ ] Update LoadingOverlay usage (App component)
- [ ] Update Button usage (various components)
- [ ] Update useLocalStorage hook (Context.tsx)
- [ ] Verify visual appearance preserved
- [ ] Test all component functionality

**Deliverables**:
- UNIT-001: Updated package.json with Mantine v7
- UNIT-003: All components migrated to v7 API

**Success Criteria**:
- [x] All Mantine packages at v7.x
- [x] All components use v7 API
- [x] Visual appearance identical
- [x] No deprecated v6 APIs

---

### FR-3: TypeScript Implementation

**Requirement**: Convert entire JavaScript codebase to TypeScript

**Unit Assignment**: **UNIT-002** (TypeScript Conversion)

**Tasks**:
- [ ] Convert all 23 React components (.js → .tsx)
- [ ] Convert all 6 service modules (.js → .ts)
- [ ] Convert all utility functions (.js → .ts)
- [ ] Convert entry points (index.js, App.js → .ts)
- [ ] Create type definitions directory (src/types/)
- [ ] Define API response types (Flight, Airport, Seat, Trip)
- [ ] Define Context state types (Cart items, search params)
- [ ] Define component prop interfaces
- [ ] Define service function signatures
- [ ] Resolve all TypeScript compilation errors
- [ ] Enable strict mode (strict: true)
- [ ] Achieve type coverage > 95%

**Deliverables**:
- All 52 files converted to TypeScript
- Type definitions in src/types/
- Zero TypeScript compilation errors
- Complete prop typing for components

**Success Criteria**:
- [x] All 52 files are .ts/.tsx
- [x] Zero compilation errors
- [x] Strict mode enabled
- [x] Type coverage > 95%

---

### FR-4: Peer Dependency Conflict Resolution

**Requirement**: Resolve peer dependency conflicts to eliminate --legacy-peer-deps flag

**Unit Assignment**: **UNIT-001** (Dependency Updates & Configuration)

**Tasks**:
- [ ] Identify specific peer dependency conflicts
- [ ] Research compatibility between packages
- [ ] Select compatible versions
- [ ] Test combinations
- [ ] Update package.json as needed
- [ ] Generate clean package-lock.json
- [ ] Verify npm install without legacy flag

**Deliverables**:
- Resolved package.json
- Clean package-lock.json
- Documentation of any npm overrides used

**Success Criteria**:
- [x] npm install clean (no --legacy-peer-deps)
- [x] No peer dependency warnings
- [x] package-lock.json valid

---

### FR-5: Code Updates for Breaking Changes

**Requirement**: Update all code to accommodate breaking changes from dependency updates

**Unit Assignments**:
- **UNIT-002**: Update for TypeScript breaking changes
- **UNIT-003**: Update for Mantine v7 breaking changes

**Tasks for UNIT-002**:
- [ ] Handle TypeScript-specific breaking changes
- [ ] Update code for strict mode requirements
- [ ] Add missing type annotations
- [ ] Fix type-related errors

**Tasks for UNIT-003**:
- [ ] Update for Mantine v7 component API changes
- [ ] Update for Mantine v7 hook changes
- [ ] Update for Mantine v7 styling changes
- [ ] Handle renamed components

**Deliverables**:
- Updated code for all breaking changes
- Compiled and working application

**Success Criteria**:
- [x] All breaking changes addressed
- [x] Code compiles without errors
- [x] Existing functionality preserved

---

### FR-6: Build Configuration Updates

**Requirement**: Update build configuration to support TypeScript and updated dependencies

**Unit Assignment**: **UNIT-001** (Dependency Updates & Configuration)

**Tasks**:
- [ ] Create tsconfig.json with React configuration
- [ ] Configure for strict TypeScript mode
- [ ] Update build scripts in package.json
- [ ] Configure react-scripts for TypeScript
- [ ] Update .gitignore for TypeScript artifacts
- [ ] Verify development server works
- [ ] Verify production build works

**Deliverables**:
- New tsconfig.json
- Updated package.json scripts
- Updated .gitignore
- Working build configuration

**Success Criteria**:
- [x] tsconfig.json created
- [x] npm start works
- [x] npm run build works
- [x] Strict mode enabled

---

### FR-7: Deployment Configuration Verification

**Requirement**: Verify and update deployment configurations for compatibility

**Unit Assignments**:
- **UNIT-001**: Dockerfile and build system updates
- **Build & Test**: Final deployment verification

**Tasks for UNIT-001**:
- [ ] Update Dockerfile Node.js base image
- [ ] Verify multi-stage build works
- [ ] Test Docker build with new dependencies
- [ ] Test Docker image runs

**Tasks for Build & Test**:
- [ ] Verify Dockerfile builds with all updates
- [ ] Test Docker image deployment
- [ ] Verify NGINX configuration works
- [ ] Test container serves application

**Deliverables**:
- Updated Dockerfile
- Verified Docker build and deployment

**Success Criteria**:
- [x] Docker builds successfully
- [x] Docker image runs correctly
- [x] NGINX serves application

---

### FR-8: Documentation Updates

**Requirement**: Update all documentation to reflect dependency changes and TypeScript

**Unit Assignments**:
- **UNIT-001**: Update for dependency changes
- **UNIT-002**: Update for TypeScript
- **UNIT-003**: Update for Mantine v7
- **Build & Test**: Final documentation

**Tasks for UNIT-001**:
- [ ] Update README with new dependency versions
- [ ] Document TypeScript setup
- [ ] Update installation instructions

**Tasks for UNIT-002**:
- [ ] Document TypeScript conversion
- [ ] Update type definitions documentation
- [ ] Add TypeScript development guide

**Tasks for UNIT-003**:
- [ ] Document Mantine v7 migration
- [ ] Update component documentation for v7 API

**Tasks for Build & Test**:
- [ ] Update README with migration summary
- [ ] Document any configuration changes
- [ ] Final review of all documentation

**Deliverables**:
- Updated README.md
- Updated code comments for types
- Migration documentation

**Success Criteria**:
- [x] README updated
- [x] Documentation reflects all changes
- [x] Clear migration notes provided

---

## Non-Functional Requirements to Unit Mapping

### NFR-1: Backwards Compatibility

**Requirement**: Maintain compatibility with external systems and APIs

**Unit Assignments**:
- **UNIT-002**: Ensure TypeScript doesn't change behavior
- **UNIT-003**: Ensure Mantine v7 maintains API compatibility

**Verification in Build & Test**

**Success Criteria**:
- [x] Backend API integration unchanged
- [x] OpenTelemetry trace format compatible
- [x] localStorage format compatible

---

### NFR-2: Performance

**Requirement**: Maintain or improve application performance

**Unit Assignments**:
- **UNIT-001**: Monitor bundle size baseline
- **UNIT-002**: Monitor TypeScript impact (may increase bundle)
- **UNIT-003**: Monitor Mantine v7 impact, optimize if needed

**Success Criteria**:
- [x] Initial load within acceptable range
- [x] Runtime performance maintained
- [x] Bundle size <= current + 15%

---

### NFR-3: Code Quality

**Requirement**: Improve code quality through TypeScript and updated tooling

**Unit Assignment**: **UNIT-002** (TypeScript Conversion)

**Tasks**:
- [ ] Enable strict mode (strict: true)
- [ ] Achieve type coverage > 95%
- [ ] Configure ESLint for TypeScript
- [ ] Fix ESLint warnings/errors
- [ ] Add type definitions for all functions

**Success Criteria**:
- [x] Strict mode enabled
- [x] Type coverage > 95%
- [x] No ESLint errors

---

### NFR-4: Build Reliability

**Requirement**: Ensure reliable and reproducible builds

**Unit Assignments**:
- **UNIT-001**: Ensure clean dependency tree
- **Build & Test**: Verify reproducible builds

**Success Criteria**:
- [x] Deterministic build process
- [x] package-lock.json ensures versions
- [x] Docker builds reproducible

---

### NFR-5: Developer Experience

**Requirement**: Maintain or improve developer experience

**Unit Assignment**: **UNIT-002** (TypeScript Conversion)

**Tasks**:
- [ ] Configure TypeScript for IDE autocomplete
- [ ] Ensure development server runs without errors
- [ ] Ensure fast rebuild times
- [ ] Provide clear error messages

**Success Criteria**:
- [x] Development server works
- [x] TypeScript IDE support active
- [x] Clear error messages

---

## Testing Requirements Mapping

### Visual Verification Testing

**Requirement**: Manual testing of core user flows

**Unit Assignments**:
- **UNIT-003**: Test during Mantine v7 migration (visual regression)
- **Build & Test**: Comprehensive testing of all 5 flows

**Testing Flows**:
1. **Flight Search Flow**: UNIT-003 spot check, Build & Test full verify
2. **Cart Management Flow**: UNIT-003 spot check, Build & Test full verify
3. **Checkout Flow**: UNIT-003 spot check, Build & Test full verify
4. **Type-Ahead Functionality**: UNIT-003 spot check, Build & Test full verify
5. **Build and Deployment**: Build & Test full verify

**Success Criteria**:
- [x] All core flows working
- [x] No visual regressions
- [x] No console errors

---

## Component to Unit Assignment

### React Components (23 total)

| Component | Path | Unit 1 | Unit 2 | Unit 3 |
|-----------|------|--------|--------|--------|
| Home | src/pages/Home/Home.js | - | Convert | Update |
| SearchFlight | src/pages/SearchFlight/SearchFlight.js | - | Convert | Update |
| Checkout | src/pages/Checkout/Checkout.js | - | Convert | Update |
| ApplicationContainer | src/components/ApplicationContainer/ApplicationContainer.js | - | Convert | Update |
| ApplicationHeader | src/components/ApplicationContainer/ApplicationHeader.js | - | Convert | Update |
| Search | src/components/Search/Search.js | - | Convert | Migrate (Autocomplete, DatePicker) |
| SearchResults | src/components/SearchResults/SearchResults.js | - | Convert | Update |
| Results | src/components/SearchResults/Results.js | - | Convert | Update |
| NoResults | src/components/SearchResults/NoResults.js | - | Convert | Update |
| TripCard | src/components/TripCard/TripCard.js | - | Convert | Update |
| TripCard FlightDetails | src/components/TripCard/FlightDetails.js | - | Convert | Update |
| Flight | src/components/Flight/Flight.js | - | Convert | Update |
| Cart | src/components/Cart/Cart.js | - | Convert | Update |
| EmptyCart | src/components/Cart/EmptyCart.js | - | Convert | Update |
| Cart FlightDetails | src/components/Cart/FlightDetails.js | - | Convert | Update |
| Confirmation | src/components/Breakdown/Confirmation.js | - | Convert | Update |
| Cost | src/components/Breakdown/Cost.js | - | Convert | Update |
| Username | src/components/Authentication/Username.js | - | Convert | Update |

### Service Modules (6 total)

| Service | Path | Unit 1 | Unit 2 | Unit 3 |
|---------|------|--------|--------|--------|
| Context | src/services/Context.js | - | Convert + Hook types | Update (useLocalStorage) |
| Flight | src/services/Flight.js | - | Convert + API types | - |
| Tracing | src/services/Tracing.js | - | Convert | - |
| CustomTracing | src/services/CustomTracing.js | - | Convert | - |
| Functions | src/services/Functions.js | - | Convert | - |
| AirportInformation | src/components/Search/AirportInformation.js | - | Convert | - |

### Entry Points (5 total)

| Entry Point | Path | Unit 1 | Unit 2 | Unit 3 |
|-------------|------|--------|--------|--------|
| index | src/index.js | - | Convert | - |
| App | src/App.js | - | Convert | Update (LoadingOverlay) |
| setupProxy | src/setupProxy.js | - | Convert | - |
| setupTests | src/setupTests.js | - | Convert | - |
| reportWebVitals | src/reportWebVitals.js | - | Convert | - |

---

## Dependency Component Story Map

### Story: Modernize FlyFast-WebUI Codebase

**Overall Objective**: Update all dependencies, implement TypeScript, migrate to Mantine v7

**User Stories Mapped**:
- All work is technical infrastructure (no end-user-facing features)
- Benefits: Type safety, latest framework versions, improved code quality

**Tasks by Unit**:

**Unit 1: Dependencies & Configuration**
- [ ] Research dependency updates (22 packages)
- [ ] Update package.json
- [ ] Resolve peer dependencies
- [ ] Create tsconfig.json
- [ ] Update build configuration
- [ ] Verify clean install

**Unit 2: TypeScript Conversion**
- [ ] Convert services (Context, Flight, Tracing, Custom Tracing, Functions)
- [ ] Create type definitions (api.ts, context.ts, components.ts)
- [ ] Convert utilities and entry points
- [ ] Convert components in dependency order
- [ ] Resolve TypeScript errors
- [ ] Achieve type coverage > 95%

**Unit 3: Mantine v7 Migration**
- [ ] Analyze Mantine v6→v7 migration guide
- [ ] Update Search component (Autocomplete, DatePickerInput, NativeSelect)
- [ ] Update layout components (Grid, Group, Paper)
- [ ] Update hooks (useLocalStorage)
- [ ] Update other components as needed
- [ ] Visual regression testing
- [ ] Verify all functionality

---

## Implementation Timeline

### Unit 1 Timeline
- **Duration**: 2-3 hours
- **Critical Path**: Yes
- **Prerequisites**: None
- **Dependencies**: None

### Unit 2 Timeline
- **Duration**: 6-8 hours
- **Critical Path**: Yes
- **Prerequisites**: Unit 1 complete
- **Dependencies**: Unit 1 output

### Unit 3 Timeline
- **Duration**: 4-6 hours
- **Critical Path**: Yes
- **Prerequisites**: Unit 2 complete
- **Dependencies**: Unit 2 output

### Build & Test Timeline
- **Duration**: 2-3 hours
- **Critical Path**: Yes
- **Prerequisites**: All units complete
- **Dependencies**: All unit outputs

**Total Timeline**: 14-20 hours

---

## Success Metrics by Unit

### Unit 1 Completion Metrics
- [x] All 22 dependencies updated
- [x] npm install clean (no warnings)
- [x] tsconfig.json created and valid
- [x] Development and production builds work
- [x] Zero build warnings

### Unit 2 Completion Metrics
- [x] All 52 files converted to .ts/.tsx
- [x] Zero TypeScript compilation errors
- [x] Type coverage > 95%
- [x] No implicit 'any' types
- [x] Development server runs
- [x] Production build succeeds

### Unit 3 Completion Metrics
- [x] All Mantine packages at v7.x
- [x] No v6 API usage remaining
- [x] Visual appearance preserved
- [x] All components functional
- [x] No console errors
- [x] Bundle size acceptable

### Final Metrics (All Units + Build & Test)
- [x] All 5 core user flows verified
- [x] No visual regressions
- [x] Performance maintained
- [x] Documentation updated
- [x] Ready for deployment

---

**Document Version**: 1.0  
**Created**: 2026-03-09
