# Requirements Document

## Intent Analysis Summary

### User Request
Using AI-DLC, update React, Mantine, OpenTelemetry, and React Router dependencies to the latest; update code for dependency changes; migrate from react-scripts to Vite and Vitest; remove legacy peer dependency handling; keep the app stable.

### Request Type
Upgrade and migration (toolchain + framework major-version migration)

### Scope Estimate
System-wide

### Complexity Estimate
Complex

### Confirmed Direction From Clarifications
- Upgrade strategy: latest stable majors with code updates for breaking changes
- Routing package strategy: migrate to react-router package usage where applicable
- Vite adoption: full migration now (dev, build, tests, config)
- Testing strategy: replace Jest scripts with Vitest setup
- Peer dependency policy: remove legacy peer dependency handling and require clean install
- Validation threshold: clean npm install + type-check + vitest + vite build must pass
- Extension applicability: security-baseline disabled for this cycle
- Preferred target versions (if compatible): React 19.2, Mantine 8.3, React Router 7, OpenTelemetry 2.6

---

## Functional Requirements

### FR-1: Core Dependency Upgrades
Priority: High

The project must upgrade React ecosystem dependencies to latest compatible stable versions, targeting:
- React 19.2 and React DOM 19.2
- Mantine 8.3 family
- React Router 7
- OpenTelemetry 2.6 line (or nearest compatible stable set)

Acceptance criteria:
- package.json updated with compatible versions
- package-lock.json regenerated cleanly
- No unresolved peer dependency conflicts
- Application compiles and runs after upgrades

### FR-2: React Router Package Migration
Priority: High

The codebase must migrate routing imports/usages to the current package/module strategy required for React Router 7, including react-router package usage where applicable.

Acceptance criteria:
- Routing imports updated according to React Router 7 guidance
- No stale incompatible react-router-dom-only assumptions remain
- Route declarations and navigation behavior preserved

### FR-3: Build Tool Migration to Vite
Priority: High

Migrate from react-scripts to Vite for development and production builds.

Acceptance criteria:
- react-scripts removed from runtime scripts/toolchain
- Vite config added and working
- npm start/build equivalents updated to Vite commands
- Dev server and production build both function
- Existing proxy/runtime-env behavior preserved or replaced with equivalent Vite approach

### FR-4: Test Runner Migration to Vitest
Priority: High

Replace Jest/react-scripts test workflow with Vitest while keeping React Testing Library based tests operational.

Acceptance criteria:
- test script runs Vitest
- test setup file(s) compatible with Vitest
- Existing tests migrated or adapted as needed
- test execution passes under Vitest

### FR-5: Remove Legacy Peer Dependency Handling
Priority: High

Remove legacy peer dependency settings and enforce clean modern dependency resolution.

Acceptance criteria:
- installConfig.legacyPeerDeps removed from package.json
- .npmrc legacy-peer-deps setting removed
- npm install succeeds without legacy peer flags

### FR-6: Breaking Change Remediation
Priority: High

Update application code to handle API and behavior changes introduced by major upgrades.

Acceptance criteria:
- All compile/runtime errors from upgrades resolved
- No degraded critical user flows (search, cart, checkout)
- No UI element removals unless migration requires rename/substitution

### FR-7: Documentation Updates
Priority: Medium

Update project documentation for new tooling and commands.

Acceptance criteria:
- README updated for Vite/Vitest commands
- Migration notes include routing/package and dependency-major changes

---

## Non-Functional Requirements

### NFR-1: Compatibility and Stability
Priority: High

The dependency set must be mutually compatible and application behavior must remain stable.

Acceptance criteria:
- No dependency conflict warnings that block install/build/test
- Core pages render and navigate correctly

### NFR-2: Build Reliability
Priority: High

Build/test steps must be deterministic in local and CI usage.

Acceptance criteria:
- clean install reproducible from lockfile
- type-check, vitest, and vite build all pass

### NFR-3: UX Preservation
Priority: High

User-visible UI should remain materially consistent with current behavior.

Acceptance criteria:
- Main layout and feature flows remain functionally equivalent
- No unnecessary component removals

### NFR-4: Developer Experience
Priority: Medium

Developer workflow should improve versus react-scripts baseline.

Acceptance criteria:
- faster/modern local dev server behavior via Vite
- clear script commands for dev/build/test/type-check

---

## Validation and Done Criteria

This migration is complete only when all of the following pass:
1. npm install (without legacy peer-deps flags)
2. npm run type-check
3. npm test (Vitest)
4. npm run build (Vite)

Additionally:
- routing behavior validated in app runtime
- search, cart, and checkout flows verified

---

## Constraints and Assumptions

Constraints:
- Preserve existing UI behavior and components unless migration requires API-level substitutions
- Keep existing backend API integration contract intact

Assumptions:
- Node/npm versions in workspace satisfy Vite and target dependency minimums
- Existing TypeScript strict setup remains in place

Out of scope:
- New features unrelated to migration
- Large visual redesign

---

## Extension Compliance Summary (This Stage)

- security-baseline: N/A (disabled in requirements answers for this cycle)

---

## Next Stage

After requirements approval, proceed to Workflow Planning for this migration cycle.
