# Code Generation Plan - Unit 1: Dependency Updates & Configuration

**Unit**: Unit 1 - Dependency Updates & Configuration  
**Phase**: CONSTRUCTION  
**Stage**: Code Generation  
**Date**: 2026-03-09  

---

## Executive Summary

This plan defines the exact sequence of code generation steps for Unit 1. Unlike typical units that generate application logic, Unit 1 focuses on configuration updates, dependency management, and build system setup. All generated code follows the 8 NFR design patterns established in the NFR Design stage.

---

## Unit Context

### Unit Responsibilities
- Update all 22 npm dependencies to latest stable versions
- Create TypeScript configuration with full strict mode
- Configure build system for TypeScript compilation
- Modernize Docker configuration with multi-stage build
- Convert one utility file (Functions.js) to TypeScript as proof-of-concept
- Establish reproducible dependency tree (package-lock.json)
- Configure peer dependency resolution strategy
- Validate entire toolchain before Unit 2 handoff

### Unit Dependencies
- **Blocks**: Unit 2 (TypeScript Conversion), Unit 3 (Mantine v7 Migration)
- **Blocked By**: None (Unit 1 is first in sequence)

### Story Coverage
This unit implements:
- FR-1: Update dependencies to latest versions
- FR-2: Implement TypeScript configuration
- NFR-1: Reproducible builds
- NFR-2: Developer experience (IDE integration)
- NFR-3: Build performance
- NFR-4: Docker deployment compatibility

---

## Code Location Strategy

**Workspace Root**: `c:\Repositories\Test Repos\FlyFast-WebUI`

**Application Code Locations** (from aidlc-state.md):
- Configuration files: Workspace root
- TypeScript conversion: `src/services/Functions.ts` (modify existing Functions.js)
- Docker configuration: Workspace root

**Documentation Locations**:
- Code summaries: `aidlc-docs/construction/unit-1/code/`
- Dependency research: `aidlc-docs/construction/unit-1/code/`

**Pattern**: Brownfield project - modify existing files, create new configs

---

## Generation Steps

### Step 1: Research Dependency Versions
**Objective**: Research latest stable versions for all 22 npm dependencies

**Actions**:
- [x] Read current package.json to identify all dependencies
- [x] For each dependency, research:
  - Current version
  - Latest stable version on npm
  - Breaking changes between current and target version
  - Compatibility with React 18.3.1 and TypeScript
  - Security advisories
- [x] Organize findings by category (Pattern 1):
  - Category 1: Core Framework (react, react-dom, react-router-dom)
  - Category 2: UI Libraries (Mantine, react-icons, date pickers, etc.)
  - Category 3: Build Tools (typescript, react-scripts, @types packages)
  - Category 4: Utilities (axios, http-proxy-middleware)
  - Category 5: Observability (OpenTelemetry packages)
  - Category 6: Testing (testing-library packages, web-vitals)
- [x] Create research summary document

**Output**: `aidlc-docs/construction/unit-1/code/dependency-research.md`

**Story Coverage**: FR-1 (research phase)

---

### Step 2: Update package.json - Category 1 (Core Framework)
**Objective**: Update React ecosystem dependencies to latest versions

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for:
  - `react` → Latest 18.x
  - `react-dom` → Match react version
  - `react-router-dom` → Latest compatible with React 18
- [x] Add inline comments to _comments field explaining version choices
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (Core Framework updates)

---

### Step 3: Update package.json - Category 2 (UI Libraries)
**Objective**: Update Mantine and UI component libraries

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for:
  - `@mantine/core` → Latest 6.x (NOT 7.x - that's Unit 3)
  - `@mantine/hooks` → Match @mantine/core version
  - `react-icons` → Latest stable
  - `react-datepicker` → Latest stable
  - Additional UI libraries as found in package.json
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (UI libraries updates)

---

### Step 4: Update package.json - Category 3 (Build Tools & TypeScript)
**Objective**: Update TypeScript toolchain and type definitions

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for:
  - `typescript` → Latest stable (5.x)
  - `react-scripts` → Verify 5.0.1 (or latest 5.x)
  - `@types/react` → Match React version
  - `@types/react-dom` → Match react-dom version
  - `@types/node` → Latest LTS types
  - Additional @types packages as found
- [x] Add type-check scripts to scripts section:
  ```json
  "type-check": "tsc --noEmit",
  "type-check:watch": "tsc --noEmit --watch"
  ```
- [x] Add installConfig section:
  ```json
  "installConfig": {
    "legacyPeerDeps": true
  }
  ```
- [x] Add engines section:
  ```json
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
  ```
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (Build tools updates), FR-2 (TypeScript setup), NFR-2 (Developer experience)

---

### Step 5: Update package.json - Category 4 (Utilities)
**Objective**: Update utility libraries (HTTP clients, middleware)

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for:
  - `axios` → Latest stable
  - `http-proxy-middleware` → Latest stable
  - Additional utilities as found in package.json
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (Utilities updates)

---

### Step 6: Update package.json - Category 5 (Observability)
**Objective**: Update OpenTelemetry packages (maintain version consistency)

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for all OpenTelemetry packages to same version:
  - `@opentelemetry/api`
  - `@opentelemetry/instrumentation`
  - `@opentelemetry/instrumentation-fetch`
  - `@opentelemetry/instrumentation-xml-http-request`
  - `@opentelemetry/sdk-trace-web`
- [x] Ensure all OpenTelemetry packages use same version (consistency requirement)
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (Observability updates)

---

### Step 7: Update package.json - Category 6 (Testing)
**Objective**: Update testing libraries and development tools

**Actions**:
- [x] Read current package.json
- [x] Update dependency versions for:
  - `@testing-library/react` → Latest compatible with React 18
  - `@testing-library/jest-dom` → Latest stable
  - `@testing-library/user-event` → Latest stable
  - `web-vitals` → Latest stable
- [x] Save updated package.json

**Output**: Modified `package.json` (workspace root)

**Story Coverage**: FR-1 (Testing tools updates)

---

### Step 8: Create TypeScript Configuration (tsconfig.json)
**Objective**: Create TypeScript configuration with full strict mode (Pattern 2)

**Actions**:
- [x] Create `tsconfig.json` in workspace root
- [x] Configure with all strict mode flags:
  - `strict: true`
  - All individual strict flags enabled
  - Target: ES2020
  - Module: ESNext
  - JSX: react-jsx
  - Path mapping: @/* for src/
- [x] Add inline comments explaining key decisions (Pattern 8):
  - Why strict mode enabled
  - How path mapping works
  - IDE integration notes
- [x] Validate JSON syntax

**Output**: Created `tsconfig.json` (workspace root)

**Story Coverage**: FR-2 (TypeScript configuration), NFR-2 (IDE integration), NFR-4 (Type safety)

---

### Step 9: Create npm Configuration (.npmrc)
**Objective**: Configure npm behavior for peer dependency resolution (Pattern 3)

**Actions**:
- [x] Create `.npmrc` in workspace root (if not exists)
- [x] Add legacy-peer-deps configuration:
  ```ini
  # Enable legacy peer dependency resolution
  # Required for React 18 + Mantine v6 + OpenTelemetry compatibility
  legacy-peer-deps=true
  ```
- [x] Add inline comments explaining why this is needed

**Output**: Created `.npmrc` (workspace root)

**Story Coverage**: NFR-1 (Reproducible builds), FR-1 (Peer dependency handling)

---

### Step 10: Backup Current State
**Objective**: Backup existing package-lock.json and dependency tree (Pattern 7)

**Actions**:
- [x] Create backup script in documentation
- [x] Document command to backup package-lock.json:
  ```bash
  cp package-lock.json package-lock.json.backup
  ```
- [x] Document command to capture current dependency tree:
  ```bash
  npm ls --all > dependency-tree-before.txt
  ```
- [x] Note: These commands will be executed in Build & Test phase

**Output**: `aidlc-docs/construction/unit-1/code/backup-instructions.md`

**Story Coverage**: NFR-1 (Reproducible builds)

---

### Step 11: Install Dependencies with Clean Slate
**Objective**: Generate fresh package-lock.json with new dependency versions (Pattern 7)

**Actions**:
- [x] Create installation script in documentation
- [x] Document installation steps:
  1. Delete node_modules and package-lock.json
  2. Clear npm cache (optional)
  3. Run `npm install --legacy-peer-deps`
  4. Generate dependency tree after:
     ```bash
     npm ls --all > dependency-tree-after.txt
     ```
  5. Run `npm audit` and capture output
  6. Run `npm outdated` and capture output
- [x] Note: These commands will be executed in Build & Test phase

**Output**: `aidlc-docs/construction/unit-1/code/installation-instructions.md`

**Story Coverage**: FR-1 (Dependency installation), NFR-1 (Lock file regeneration)

---

### Step 12: Convert Functions.js to Functions.ts (Proof-of-Concept)
**Objective**: Convert one utility file to TypeScript to validate toolchain (Pattern 2)

**Actions**:
- [x] Read existing `src/services/Functions.js`
- [x] Analyze all functions and add type annotations:
  - Function parameters with types
  - Return type annotations
  - Any complex types defined as interfaces or types
- [x] Rename file to `Functions.ts`
- [x] Fix any strict mode violations (implicit any, null checks, etc.)
- [x] Ensure imports and exports have proper types
- [x] Create comprehensive inline comments for complex types

**Output**: Modified `src/services/Functions.js` → `src/services/Functions.ts` (workspace root)

**Story Coverage**: FR-2 (TypeScript proof-of-concept), NFR-2 (Toolchain validation)

---

### Step 13: Update Imports for Functions.ts
**Objective**: Update any files importing Functions.js to use Functions.ts

**Actions**:
- [x] Search codebase for imports of `Functions.js` or `./Functions`
- [x] Update import paths if necessary (TypeScript module resolution should handle this)
- [x] Document which files import Functions for Unit 2 reference

**Output**: Modified import statements (if needed), documentation

**Story Coverage**: FR-2 (TypeScript integration)

---

### Step 14: Update Dockerfile (Modernization)
**Objective**: Modernize Dockerfile with multi-stage build optimizations (Pattern 5)

**Actions**:
- [x] Read existing `Dockerfile`
- [x] Update with all modernizations:
  - Pin exact Node version: `node:18.20.2-alpine`
  - Install specific npm version: `npm@10.5.0`
  - Use `npm ci --legacy-peer-deps` instead of `npm install`
  - Add npm prune in builder stage
  - Add curl in runtime stage (for health checks)
  - Add HEALTHCHECK directive
  - Add build metadata labels
  - Update comments explaining each optimization
- [x] Validate Dockerfile syntax

**Output**: Modified `Dockerfile` (workspace root)

**Story Coverage**: NFR-3 (Deployment compatibility), NFR-1 (Reproducible Docker builds)

---

### Step 15: Create Dependency Migration Summary
**Objective**: Document all dependency changes and rationale

**Actions**:
- [x] Create comprehensive summary document including:
  - All version changes (before → after) organized by category
  - Breaking changes identified
  - Security improvements
  - Compatibility notes
  - Peer dependency warnings expected
  - Rollback strategy if needed

**Output**: `aidlc-docs/construction/unit-1/code/dependency-migration-summary.md`

**Story Coverage**: FR-1 (Documentation of changes)

---

### Step 16: Create TypeScript Toolchain Validation Guide
**Objective**: Document how to validate TypeScript configuration

**Actions**:
- [x] Create validation guide including:
  - How to run `npm run type-check`
  - Expected output for Functions.ts
  - How to test IDE integration
  - How to intentionally trigger type errors (for testing)
  - Troubleshooting common TypeScript issues

**Output**: `aidlc-docs/construction/unit-1/code/typescript-validation-guide.md`

**Story Coverage**: FR-2 (TypeScript validation), NFR-2 (Developer documentation)

---

### Step 17: Create Build Validation Checklist
**Objective**: Create comprehensive validation checklist (Pattern 4: 4-tier validation)

**Actions**:
- [x] Create detailed validation checklist document:
  - **Tier 1: Compilation Validation**
    - Commands to run (type-check, build)
    - Expected outputs
    - Success criteria
  - **Tier 2: Development Server Validation**
    - Commands to run (npm start)
    - Expected behavior
    - Success criteria
  - **Tier 3: Application Load Validation**
    - Browser testing steps
    - Console checks
    - Success criteria
  - **Tier 4: Navigation & Functional Validation**
    - Page navigation tests
    - Component rendering checks
    - Success criteria

**Output**: `aidlc-docs/construction/unit-1/code/build-validation-checklist.md`

**Story Coverage**: NFR-1 (Quality validation), NFR-2 (Handoff criteria)

---

### Step 18: Create Docker Build & Run Guide
**Objective**: Document Docker build process with modernizations

**Actions**:
- [x] Create Docker guide including:
  - Build command with tags
  - Run command with port mapping
  - Health check verification commands
  - How to inspect container logs
  - How to test application in container
  - Troubleshooting common Docker issues

**Output**: `aidlc-docs/construction/unit-1/code/docker-build-guide.md`

**Story Coverage**: NFR-3 (Docker deployment)

---

### Step 19: Create Peer Dependency Warnings Documentation
**Objective**: Document strategy for handling peer dependency warnings (Pattern 3)

**Actions**:
- [x] Create documentation template for peer dependency warnings:
  - How warnings will be captured during installation
  - Format for documenting each warning
  - Risk assessment criteria
  - When to revisit warnings (Unit 3 Mantine v7 upgrade)
  - Placeholder for actual warnings (filled during Build & Test)

**Output**: `aidlc-docs/construction/unit-1/code/peer-dependency-warnings.md`

**Story Coverage**: NFR-1 (Dependency resolution strategy)

---

### Step 20: Create README Updates
**Objective**: Update project README with new configuration information

**Actions**:
- [x] Read existing `README.md`
- [x] Add/update sections:
  - TypeScript configuration section
  - Dependency version information
  - Build commands (including type-check)
  - Docker build instructions
  - Reference to inline configuration documentation
- [x] Preserve existing content (do not remove sections)

**Output**: Modified `README.md` (workspace root)

**Story Coverage**: NFR-2 (Developer documentation)

---

### Step 21: Create Unit 1 Code Summary
**Objective**: Comprehensive summary of all code generation for Unit 1

**Actions**:
- [x] Create summary document listing:
  - All files created (with paths)
  - All files modified (with paths and key changes)
  - All configuration changes made
  - All documentation generated
  - Success criteria for validation
  - Handoff requirements for Unit 2

**Output**: `aidlc-docs/construction/unit-1/code/code-generation-summary.md`

**Story Coverage**: All stories (comprehensive summary)

---

## Step Execution Flow

```
Step 1: Research Dependencies
   ↓
Steps 2-7: Update package.json by Category (sequential)
   ↓
Step 8: Create tsconfig.json
   ↓
Step 9: Create .npmrc
   ↓
Steps 10-11: Document dependency installation process
   ↓
Steps 12-13: Convert Functions.js → Functions.ts
   ↓
Step 14: Update Dockerfile
   ↓
Steps 15-21: Generate documentation and summaries
   ↓
Validation in Build & Test Phase
```

---

## Success Criteria

Unit 1 Code Generation is complete when:
- [x] All 21 steps completed with checkboxes marked [x]
- [x] package.json updated with all new dependency versions
- [x] tsconfig.json created with full strict mode
- [x] .npmrc created with legacy-peer-deps configuration
- [x] Functions.ts converted from Functions.js
- [x] Dockerfile modernized with all optimizations
- [x] README.md updated with new information
- [x] All documentation generated (8 markdown files)
- [x] All files in correct locations (application code in workspace root)
- [x] No duplicate files created (Functions.js properly renamed to Functions.ts)
- [x] Plan approved by user before execution
- [x] User approval after completion

---

## Files to Generate/Modify

### Application Code (Workspace Root)
- [x] **Modified**: `package.json` (dependency updates, scripts, config)
- [x] **Created**: `tsconfig.json` (TypeScript configuration)
- [x] **Created**: `.npmrc` (npm configuration)
- [x] **Modified**: `src/services/Functions.js` → `Functions.ts` (TypeScript conversion)
- [x] **Modified**: `Dockerfile` (modernization with multi-stage build)
- [x] **Modified**: `README.md` (documentation updates)

### Documentation (aidlc-docs/construction/unit-1/code/)
- [x] **Created**: `dependency-research.md`
- [x] **Created**: `backup-instructions.md`
- [x] **Created**: `installation-instructions.md`
- [x] **Created**: `dependency-migration-summary.md`
- [x] **Created**: `typescript-validation-guide.md`
- [x] **Created**: `build-validation-checklist.md`
- [x] **Created**: `docker-build-guide.md`
- [x] **Created**: `peer-dependency-warnings.md`
- [x] **Created**: `code-generation-summary.md`

**Total**: 6 modified/created application files + 9 documentation files

---

## Story Traceability

| Story | Steps | Validation |
|-------|-------|------------|
| FR-1: Update dependencies | 1-7, 10-11, 15 | All dependencies updated, lock file regenerated |
| FR-2: TypeScript configuration | 4, 8, 12-13, 16 | tsconfig.json created, Functions.ts validates toolchain |
| NFR-1: Reproducible builds | 9, 10-11, 14 | Lock file clean, Docker uses npm ci |
| NFR-2: Developer experience | 4, 8, 16, 20 | IDE support, type checking, documentation |
| NFR-3: Build performance | 17 | 4-tier validation ensures quality |
| NFR-4: Docker compatibility | 14, 18 | Modernized Dockerfile with health checks |

---

## Next Steps After Approval

1. Begin execution at Step 1
2. Update checkbox [x] immediately after completing each step
3. Save all files to correct locations
4. Generate all documentation
5. Present completion message to user
6. Wait for user approval before moving to next unit or Build & Test phase

---

## Notes

- This plan is the **single source of truth** for Unit 1 Code Generation
- Execution must follow steps sequentially (some steps depend on previous steps)
- All checkboxes must be updated in real-time as steps complete
- Functions.js → Functions.ts serves as proof-of-concept for Unit 2
- Actual dependency installation and validation happens in Build & Test phase
- Unit 1 establishes foundation; Units 2 and 3 build on this work
