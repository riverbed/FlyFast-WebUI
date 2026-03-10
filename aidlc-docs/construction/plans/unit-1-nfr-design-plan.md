# NFR Design Plan - Unit 1: Dependency Updates & Configuration

**Unit**: Unit 1 - Dependency Updates & Configuration  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-09  

---

## Plan Overview

This plan defines the NFR design approach for Unit 1, focusing on incorporating non-functional requirements into concrete design patterns and logical components. Since Unit 1 is primarily configuration-focused (dependency updates, TypeScript setup, build configuration), this design will focus on patterns and components that ensure reliable, reproducible, and maintainable outcomes.

---

## NFR Requirements Analysis Summary

From `nfr-requirements.md`, the key NFR categories for Unit 1 are:
1. **Reliability & Reproducibility** - Consistent builds across environments
2. **Developer Experience & IDE Integration** - Practical TypeScript and tooling
3. **Dependency Management Strategy** - Stable versions, peer dependency handling
4. **Build Performance** - Acceptable performance without specific targets
5. **Type Safety & Code Quality** - Full strict mode TypeScript
6. **Documentation** - Inline comments only
7. **Deployment Compatibility** - Docker build support
8. **Monitoring & Metrics** - Skip baseline, measure if needed

---

## Design Questions

The following questions help clarify specific design patterns and logical component decisions for Unit 1.

### Question 1: Dependency Update Sequencing

**Context**: Unit 1 updates all 22 dependencies. The order of updates can affect success rate (some dependencies may conflict if updated in wrong order).

**Options**:
- **A**: All at once - Update all 22 dependencies simultaneously in package.json, run single npm install
- **B**: Critical first - Update React/React-DOM first, test, then update remaining dependencies
- **C**: By category - Group dependencies (UI libraries, build tools, utilities) and update each group sequentially
- **D**: One by one - Update each dependency individually, test after each (most cautious)

**Question**: What dependency update sequencing approach minimizes risk of conflicts?

[Answer]: C

---

### Question 2: TypeScript Configuration Migration Path

**Context**: The project has TypeScript listed as dependency but completely unused. Unit 1 creates tsconfig.json but actual conversion happens in Unit 2.

**Options**:
- **A**: No validation - Create tsconfig.json with strict mode, don't test until Unit 2 begins conversion
- **B**: Smoke test - Create minimal .ts file (e.g., types.ts) to verify TypeScript compiler works
- **C**: Parallel existence - Allow .js and .ts files to coexist; configure tsconfig to only check .ts files initially
- **D**: Full validation - Convert one small utility file to TypeScript in Unit 1 to prove entire toolchain works

**Question**: How should we validate TypeScript configuration readiness in Unit 1?

[Answer]: D

---

### Question 3: Peer Dependency Conflict Resolution Pattern

**Context**: User approved using `--legacy-peer-deps` if needed. Multiple strategies exist for handling peer dependencies systematically.

**Options**:
- **A**: Ignore warnings - Use --legacy-peer-deps, document warnings, resolve in future if issues emerge
- **B**: npm overrides - Use package.json "overrides" field to specify exact versions for conflicting peer deps
- **C**: Selective resolutions - Identify specific conflicts; use overrides only for blocking issues
- **D**: Yarn/pnpm alternative - Consider switching to yarn or pnpm which handle peer deps differently

**Question**: Which peer dependency resolution pattern best balances pragmatism and maintainability?

[Answer]: A

---

### Question 4: Build Validation Checkpoints

**Context**: Unit 1 changes dependencies and configuration. Need to define what "successful build" means before handing off to Unit 2.

**Options**:
- **A**: Compile only - Build must complete without errors; warnings acceptable
- **B**: Compile + serve - Build completes AND dev server launches without crashes
- **C**: Compile + serve + load - Build completes, dev server launches, homepage loads in browser
- **D**: Full functional - Build completes, dev server launches, all pages navigable, no console errors

**Question**: What level of build validation should Unit 1 achieve before handoff to Unit 2?

[Answer]: D

---

### Question 5: Docker Build Strategy

**Context**: Dockerfile needs update to support npm ci with --legacy-peer-deps and TypeScript. Docker builds should be reproducible.

**Options**:
- **A**: Minimal change - Only add --legacy-peer-deps flag to npm ci; no other changes
- **B**: Version pin - Pin exact npm version in Dockerfile to ensure consistency
- **C**: Build optimization - Implement multi-stage caching for node_modules to speed up rebuilds
- **D**: Full modernization - Update Node version, optimize layer caching, add health checks

**Question**: What Docker build strategy balances reliability with effort in Unit 1?

[Answer]: D

---

### Question 6: Configuration File Organization

**Context**: Unit 1 creates/modifies multiple config files (tsconfig.json, package.json, possibly .npmrc, Dockerfile). Organization affects maintainability.

**Options**:
- **A**: Root only - All config files in project root (current pattern)
- **B**: Config directory - Create /config directory for all configuration files
- **C**: Split configs - Separate configs for development (tsconfig.json) and production (tsconfig.prod.json)
- **D**: Extends pattern - Create base tsconfig.base.json, extend with tsconfig.json and tsconfig.build.json

**Question**: What configuration file organization pattern works best for this project?

[Answer]: A

---

## Design Artifacts to Generate

Based on answers above, the following artifacts will be generated:

### 1. NFR Design Patterns Document
**File**: `aidlc-docs/construction/unit-1/nfr-design/nfr-design-patterns.md`

**Will Include**:
- [x] Dependency update sequencing pattern (based on Q1)
- [x] TypeScript configuration validation pattern (based on Q2)
- [x] Peer dependency resolution pattern (based on Q3)
- [x] Build validation checkpoint pattern (based on Q4)
- [x] Docker build reproducibility pattern (based on Q5)
- [x] Configuration file organization pattern (based on Q6)
- [x] Lock file regeneration pattern (from NFR requirements)
- [x] Inline documentation pattern (from NFR requirements)

### 2. Logical Components Document
**File**: `aidlc-docs/construction/unit-1/nfr-design/logical-components.md`

**Will Include**:
- [x] Build system components (npm, react-scripts, TypeScript compiler)
- [x] Dependency resolution components (npm registry, package-lock.json, node_modules)
- [x] Development environment components (IDE integration, type checking, dev server)
- [x] Deployment components (Docker multi-stage build, NGINX serving)
- [x] Configuration components (tsconfig.json, package.json, .npmrc if needed)

---

## Success Criteria

Unit 1 NFR Design is complete when:
- ✅ All 6 questions answered by user
- ✅ Answers analyzed for ambiguities (follow-up questions if needed)
- ✅ nfr-design-patterns.md generated with 8 design patterns
- ✅ logical-components.md generated with 5 component categories
- ✅ Design aligns with NFR requirements from previous stage
- ✅ All design patterns are actionable for code generation stage
- ✅ User explicitly approves NFR design before proceeding

---

## Next Steps

1. **User Action**: Answer all 6 questions using [Answer]: tag
2. **AI Action**: Analyze answers for clarity and consistency
3. **AI Action**: Generate NFR design artifacts
4. **AI Action**: Present completion message and wait for approval
5. **Next Stage**: Code Generation (Infrastructure Design skipped per execution plan)
