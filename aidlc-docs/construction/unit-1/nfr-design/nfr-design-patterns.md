# NFR Design Patterns - Unit 1

**Unit**: Unit 1 - Dependency Updates & Configuration  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-09  

---

## Executive Summary

This document defines 8 design patterns that incorporate non-functional requirements into Unit 1's implementation. These patterns ensure reliable, reproducible, and maintainable dependency updates, TypeScript configuration, and build system setup that prepare the codebase for Unit 2 (TypeScript conversion) and Unit 3 (Mantine v7 migration).

---

## Pattern 1: Category-Based Dependency Update Sequencing

**Pattern Name**: Grouped Dependency Updates  
**Category**: Reliability & Risk Management  
**Decision Source**: NFR Design Question 1, Answer C

### Problem
Updating all 22 dependencies simultaneously increases risk of cascading conflicts and makes debugging difficult. Updating one-by-one is too slow. Need balance between safety and efficiency.

### Solution
Group dependencies into logical categories and update each category sequentially:

**Category 1: Core Framework (Highest Priority)**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "latest"
}
```
- Update React ecosystem dependencies first
- Test build after this category
- Critical path dependencies that other packages depend on

**Category 2: UI Libraries**
```json
{
  "@mantine/core": "^6.0.21",
  "@mantine/hooks": "^6.0.21",
  "react-icons": "latest",
  "react-datepicker": "latest",
  "react-carousel": "latest"
}
```
- Update Mantine to latest v6.x (stay in v6 for Unit 1)
- Update other UI component libraries
- Test build after this category

**Category 3: Build Tools & TypeScript**
```json
{
  "typescript": "latest",
  "react-scripts": "^5.0.1",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "@types/node": "latest"
}
```
- Update TypeScript to latest stable
- Update type definitions
- Verify react-scripts compatibility
- Test build after this category

**Category 4: Utilities & HTTP Clients**
```json
{
  "axios": "latest",
  "http-proxy-middleware": "latest"
}
```
- Update utility libraries
- Test build after this category

**Category 5: Observability & Monitoring**
```json
{
  "@opentelemetry/api": "latest",
  "@opentelemetry/instrumentation": "latest",
  "@opentelemetry/instrumentation-fetch": "latest",
  "@opentelemetry/instrumentation-xml-http-request": "latest",
  "@opentelemetry/sdk-trace-web": "latest"
}
```
- Update OpenTelemetry packages as a group (maintain version consistency)
- Test build after this category

**Category 6: Testing & Development Tools**
```json
{
  "@testing-library/react": "latest",
  "@testing-library/jest-dom": "latest",
  "@testing-library/user-event": "latest",
  "web-vitals": "latest"
}
```
- Update testing utilities last (lowest risk)
- Test build after this category

### Implementation Steps
1. Create branch for dependency updates
2. For each category (1-6):
   - Update package.json with new versions for that category
   - Run `npm install --legacy-peer-deps`
   - Run `npm audit` and document findings
   - Run `npm run build` to verify compilation
   - Run `npm start` to verify dev server
   - Commit changes with message: "Update Category N: [category name]"
3. If any category fails, troubleshoot before proceeding
4. After all categories updated, perform full validation (Pattern 4)

### Benefits
- **Isolated debugging**: If conflicts arise, know which category caused them
- **Incremental progress**: Can pause between categories if needed
- **Git history**: Clear commit history shows exactly what changed when
- **Risk mitigation**: Critical dependencies updated first; low-risk items last

### Success Criteria
- [ ] All 6 categories updated successfully
- [ ] Build passes after each category
- [ ] Git commits clearly show category-by-category progression
- [ ] Total time < 1 hour for all updates

---

## Pattern 2: Full Validation TypeScript Configuration

**Pattern Name**: Proof-of-Concept TypeScript Conversion  
**Category**: Developer Experience & Risk Mitigation  
**Decision Source**: NFR Design Question 2, Answer D

### Problem
Unit 1 creates strict TypeScript configuration but doesn't convert any code. Unit 2 will attempt full conversion. Risk: TypeScript toolchain might not work, blocking Unit 2 at start.

### Solution
Create AND validate TypeScript configuration by converting one small utility file as proof-of-concept.

**Target File for Conversion**: `src/services/Functions.js`
- Small utility file with pure functions
- No React component dependencies
- Low risk for initial conversion
- Tests entire TypeScript toolchain (compiler, type checking, IDE integration)

### Implementation Steps

**Step 1: Create tsconfig.json** (strict mode from NFR Requirements)
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "build", "dist"]
}
```

**Step 2: Convert Functions.js → Functions.ts**
- Rename file to `.ts` extension
- Add explicit type annotations for all functions
- Add return type annotations
- Fix any strict mode violations
- Keep functionality identical

**Step 3: Update Imports**
- Find all files importing `Functions.js`
- Update imports to use `Functions.ts` (or rely on module resolution)
- Verify no import errors

**Step 4: Validate Toolchain**
- [ ] Run `npm run type-check` (tsc --noEmit) - should succeed
- [ ] Run `npm run build` - should succeed with .ts file compiled
- [ ] Run `npm start` - dev server should launch
- [ ] Open IDE - should show TypeScript IntelliSense for Functions.ts
- [ ] Make intentional type error - should be caught by compiler
- [ ] Check build output - Functions.ts should be transpiled to JS

### Benefits
- **Early validation**: Proves TypeScript works before Unit 2 starts
- **Toolchain verification**: Confirms compiler, IDE, build tools all integrated
- **Risk reduction**: If problems exist, discovered in Unit 1 (easier to fix)
- **Template creation**: Functions.ts serves as reference for Unit 2 conversion

### Success Criteria
- [ ] tsconfig.json created with full strict mode
- [ ] Functions.js converted to Functions.ts with type annotations
- [ ] Build succeeds with mixed .js and .ts files
- [ ] Type checking works (catches intentional errors)
- [ ] IDE IntelliSense functions correctly
- [ ] Dev server runs with TypeScript compilation

---

## Pattern 3: Pragmatic Peer Dependency Resolution

**Pattern Name**: Document and Defer  
**Category**: Dependency Management  
**Decision Source**: NFR Design Question 3, Answer A

### Problem
Peer dependency conflicts between React 18, Mantine v6, and other packages require resolution strategy. Overrides add complexity; changing package managers adds risk.

### Solution
Use `--legacy-peer-deps` flag, document all warnings, defer resolution to future if issues emerge.

### Implementation Details

**package.json Configuration**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "installConfig": {
    "legacyPeerDeps": true
  }
}
```

**npm Commands**
```bash
# Development installation
npm install --legacy-peer-deps

# CI/CD and Docker
npm ci --legacy-peer-deps

# Audit (check production dependencies only)
npm audit --only=prod
```

**.npmrc File** (optional, if installConfig doesn't work)
```
legacy-peer-deps=true
```

**Documentation Pattern** (inline in package.json)
```json
{
  "comments": {
    "legacyPeerDeps": "Using --legacy-peer-deps to resolve conflicts between React 18, Mantine v6, and OpenTelemetry packages. Known conflicts: [list them]. These may resolve naturally when upgrading to Mantine v7 in Unit 3. If runtime issues emerge, revisit with npm overrides."
  }
}
```

### Conflict Documentation Process
1. Run `npm install --legacy-peer-deps --verbose`
2. Capture all WARN messages about peer dependencies
3. Create `peer-dependency-warnings.md` in aidlc-docs/construction/unit-1/nfr-design/
4. Document each warning with:
   - Package causing conflict
   - Expected peer version vs. installed version
   - Risk assessment (low/medium/high)
   - Mitigation plan (monitor, fix in Unit 3, etc.)

### When to Revisit
- **Immediate Action Required If**:
  - Application fails to run due to peer dependency issue
  - Build fails with peer dependency error
  - Critical security vulnerability in peer dependency
  
- **Deferred to Unit 3 If**:
  - Warnings appear but application runs fine
  - Conflicts likely resolve with Mantine v7 upgrade
  - No runtime errors observed

### Benefits
- **Pragmatic**: Avoids over-engineering for theoretical problems
- **Fast execution**: No complex override configurations
- **Documented**: Warnings captured for future reference
- **Reversible**: Can add npm overrides later if needed

### Success Criteria
- [ ] Installation succeeds with --legacy-peer-deps
- [ ] All peer dependency warnings documented
- [ ] Application builds and runs despite warnings
- [ ] No runtime errors related to peer dependencies
- [ ] Clear documentation of deferral strategy

---

## Pattern 4: Full Functional Build Validation

**Pattern Name**: Comprehensive Pre-Handoff Verification  
**Category**: Quality Assurance & Risk Management  
**Decision Source**: NFR Design Question 4, Answer D

### Problem
Unit 1 establishes foundation for Units 2 and 3. Inadequate validation risks cascade failures. Need comprehensive validation without excessive overhead.

### Solution
Four-tier validation pyramid ensuring complete readiness before Unit 2 handoff.

### Validation Tiers

**Tier 1: Compilation Validation**
```bash
# TypeScript type checking
npm run type-check

# Production build
npm run build

# Expected outputs:
# - build/ directory created
# - No compilation errors
# - Only warnings allowed: unused variables in .js files (will be fixed in Unit 2)
```

**Tier 2: Development Server Validation**
```bash
# Start dev server
npm start

# Expected outcomes:
# - Server launches on port 3000
# - No crash on startup
# - No red error messages in console
# - Warnings acceptable (peer deps, unused vars)
```

**Tier 3: Application Load Validation**
```bash
# With dev server running:
# 1. Open browser to http://localhost:3000
# 2. Verify homepage loads
# 3. Check browser console for errors

# Expected outcomes:
# - Homepage renders correctly
# - No red console errors
# - UI matches pre-migration screenshots (if available)
```

**Tier 4: Navigation & Functional Validation**
```
# Manual testing checklist:
- [ ] Homepage loads (/)
- [ ] Search page navigates (/search or main search component)
- [ ] Checkout page accessible
- [ ] All Mantine components render (buttons, inputs, modals)
- [ ] No console errors during navigation
- [ ] Cart functionality accessible
- [ ] No broken imports or missing dependencies
```

### Validation Checklist Template

Create `validation-results.md`:
```markdown
# Unit 1 Validation Results

**Date**: [timestamp]
**Validator**: [name]
**Branch**: [branch name]

## Tier 1: Compilation ✅/❌
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] build/ directory contains valid assets
- [ ] No compilation errors
- [ ] Warnings documented: [list any warnings]

## Tier 2: Development Server ✅/❌
- [ ] `npm start` launches successfully
- [ ] Server runs on port 3000
- [ ] No startup crashes
- [ ] Console shows ready message

## Tier 3: Application Load ✅/❌
- [ ] Homepage loads in browser
- [ ] No console errors
- [ ] UI appears correctly
- [ ] Network requests succeed (if any on homepage)

## Tier 4: Navigation & Functional ✅/❌
- [ ] All pages navigable
- [ ] Search functionality works
- [ ] Cart operations work
- [ ] Checkout accessible
- [ ] No broken components
- [ ] Mantine UI components render correctly

## Issues Identified
[List any issues found during validation]

## Blockers for Unit 2
[List any issues that would block Unit 2 from starting]

## Sign-Off
- [ ] All tiers pass
- [ ] No blocking issues
- [ ] Ready for Unit 2 handoff
```

### Automation Potential
```json
// package.json scripts for validation
{
  "scripts": {
    "validate:compile": "npm run type-check && npm run build",
    "validate:server": "npm start",
    "validate:full": "npm run validate:compile && echo 'Manual validation required for Tiers 3-4'"
  }
}
```

### Benefits
- **Comprehensive**: Validates entire stack from compilation to user interaction
- **No surprises**: Unit 2 starts with confidence in foundations
- **Documented**: Clear record of validation performed
- **Repeatable**: Checklist can be run after any configuration change

### Success Criteria
- [ ] All 4 tiers pass validation
- [ ] validation-results.md completed with ✅ for all items
- [ ] No blocking issues identified
- [ ] Team confident to proceed to Unit 2

---

## Pattern 5: Full Docker Build Modernization

**Pattern Name**: Production-Ready Container Configuration  
**Category**: Deployment & Reproducibility  
**Decision Source**: NFR Design Question 5, Answer D

### Problem
Existing Dockerfile needs updates for new dependencies, TypeScript support, and build optimization. Opportunity to modernize entire Docker configuration for long-term maintainability.

### Solution
Comprehensive Dockerfile update with version pinning, layer optimization, and health checks.

### Updated Dockerfile

```dockerfile
# ==============================================================================
# Build Stage - Compile TypeScript and bundle React application
# ==============================================================================
FROM node:18.20.2-alpine AS builder

# Pin exact Node and npm versions for reproducibility
RUN npm install -g npm@10.5.0

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies with legacy peer deps flag
# Use npm ci for reproducible installs (respects package-lock.json)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copy source code
COPY . .

# Build application (compiles TypeScript + bundles React)
# NODE_ENV=production optimizes build output
ENV NODE_ENV=production
RUN npm run build

# Remove development dependencies to reduce final image size
RUN npm prune --production --legacy-peer-deps

# ==============================================================================
# Runtime Stage - Serve static files with NGINX
# ==============================================================================
FROM nginx:1.27.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy NGINX configuration template
COPY default.conf.template /etc/nginx/templates/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check endpoint
# Checks every 30s, timeout 10s, 3 retries before marking unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Add build metadata labels
LABEL maintainer="FlyFast Development Team"
LABEL version="1.0"
LABEL description="FlyFast WebUI - React 18 + Mantine v7 + TypeScript"

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
```

### Layer Optimization Rationale

**Why Multi-Stage Build**:
- Separates build dependencies from runtime
- Reduces final image size (no node_modules in production image)
- Only compiled static files in NGINX container

**Why npm ci instead of npm install**:
- Respects package-lock.json exactly (reproducibility)
- Faster than npm install in CI environments
- Fails if package.json and package-lock.json out of sync

**Why npm prune --production**:
- Removes devDependencies from node_modules
- Reduces builder stage size (though not in final image)
- Best practice for production builds

**Why Version Pinning**:
- `node:18.20.2-alpine` - Exact Node version for reproducibility
- `npm@10.5.0` - Exact npm version ensures consistent behavior
- `nginx:1.27.0-alpine` - Specific NGINX version

**Why Health Check**:
- Kubernetes/Docker Swarm can monitor container health
- Automatic restart if health check fails
- Production readiness indicator

### Build & Run Commands

```bash
# Build Docker image
docker build -t flyfast-webui:latest .

# Run container locally
docker run -p 3000:80 --name flyfast flyfast-webui:latest

# Check health status
docker inspect --format='{{.State.Health.Status}}' flyfast

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' flyfast
```

### Environment Variable Support

Update `default.conf.template` if environment-specific configuration needed:
```nginx
server {
    listen 80;
    server_name ${NGINX_HOST};
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Validation Checklist

```markdown
## Docker Build Validation

- [ ] Docker build completes without errors
- [ ] Build time < 5 minutes (typical)
- [ ] Final image size < 100MB (NGINX + static files)
- [ ] Container starts successfully
- [ ] Health check passes within 30 seconds
- [ ] Application accessible on http://localhost:3000
- [ ] All assets load correctly (no 404s)
- [ ] Environment variables work (if used)
```

### Benefits
- **Reproducibility**: Pinned versions ensure identical builds
- **Optimization**: Multi-stage reduces image size by ~500MB
- **Production-Ready**: Health checks enable orchestration monitoring
- **Maintainability**: Clear comments explain each optimization
- **Modern Best Practices**: Follows Docker best practices for 2026

### Success Criteria
- [ ] Dockerfile updated with all modernizations
- [ ] Docker build succeeds
- [ ] Container runs and serves application
- [ ] Health check functional
- [ ] Documentation updated with new build commands

---

## Pattern 6: Root-Level Configuration Organization

**Pattern Name**: Flat Configuration Structure  
**Category**: Maintainability & Simplicity  
**Decision Source**: NFR Design Question 6, Answer A

### Problem
Multiple configuration files need clear organization. Over-organization adds complexity; under-organization causes confusion.

### Solution
Keep all configuration files in project root (current pattern). Use clear naming and inline documentation.

### Configuration File Layout

```
<project-root>/
├── package.json                 # npm dependencies and scripts
├── package-lock.json            # Locked dependency tree
├── tsconfig.json                # TypeScript compiler configuration
├── .npmrc                       # npm configuration (legacy-peer-deps)
├── Dockerfile                   # Docker build instructions
├── default.conf.template        # NGINX configuration
├── .gitignore                   # Git exclusions
├── README.md                    # Project documentation
└── src/                         # Source code
```

### Configuration File Purposes

| File | Purpose | Created In | Modified In |
|------|---------|-----------|-------------|
| `package.json` | Dependencies, scripts, metadata | Existing | Unit 1, 2, 3 |
| `package-lock.json` | Locked dependency versions | Unit 1 (regenerated) | Unit 1 |
| `tsconfig.json` | TypeScript compiler settings | Unit 1 | Unit 2 (if needed) |
| `.npmrc` | npm behavioral flags | Unit 1 (if needed) | - |
| `Dockerfile` | Container build process | Existing | Unit 1 |
| `default.conf.template` | NGINX server config | Existing | Unit 1 (if needed) |

### Inline Documentation Strategy

Each configuration file gets explanatory comments:

**tsconfig.json**:
```json
{
  "compilerOptions": {
    // Strict Type Checking - Enables all strict mode flags for maximum type safety
    "strict": true,
    
    // Module Resolution - Standard Node.js resolution for npm packages
    "moduleResolution": "node",
    
    // JSX Support - React 17+ automatic JSX transformation
    "jsx": "react-jsx",
    
    // Path Mapping - Enables @/ imports for cleaner relative paths
    "baseUrl": "./src",
    "paths": { "@/*": ["./*"] }
  }
}
```

**package.json** (comments in separate comment field):
```json
{
  "name": "flyfast-webui",
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  },
  "installConfig": {
    "legacyPeerDeps": true
  },
  "_comments": {
    "legacyPeerDeps": "Required to resolve peer dependency conflicts between React 18, Mantine v6, and OpenTelemetry. See peer-dependency-warnings.md for details.",
    "type-check-scripts": "Added in Unit 1 for TypeScript validation. Used by IDEs and CI/CD pipelines."
  }
}
```

### Benefits of Root-Level Organization
- **Discoverability**: All configs in predictable location
- **Tooling compatibility**: Most tools expect configs in root
- **Simplicity**: No need to configure custom config paths
- **Standard practice**: Matches 99% of React projects
- **IDE support**: IDEs auto-detect configs in root

### When NOT to Use Root-Level
- Monorepo with multiple packages (use workspaces)
- Multiple TypeScript configs needed (use extends pattern)
- Enterprise standards require /config directory

**For this project**: Root-level is appropriate (single React SPA, no monorepo).

### Success Criteria
- [ ] All configs in project root
- [ ] Each config file has inline comments
- [ ] No nested /config directory created
- [ ] IDEs auto-detect all configurations
- [ ] Build tools find configs without custom paths

---

## Pattern 7: Clean Lock File Regeneration

**Pattern Name**: Fresh Start Dependency Lock  
**Category**: Reliability & Reproducibility  
**Decision Source**: NFR Requirements Q6=A (Strict regenerate)

### Problem
Existing package-lock.json may have accumulated technical debt, outdated resolutions, or unnecessary dependencies from previous experiments.

### Solution
Completely regenerate package-lock.json during Unit 1 for clean dependency tree.

### Implementation Process

**Step 1: Backup Current State**
```bash
# Create backup of current lock file
cp package-lock.json package-lock.json.backup

# Document current dependency tree
npm ls --all > dependency-tree-before.txt
```

**Step 2: Clean Slate**
```bash
# Remove existing lock file and node_modules
rm -rf node_modules package-lock.json

# Clear npm cache (optional, but ensures truly fresh install)
npm cache clean --force
```

**Step 3: Update package.json**
```bash
# Update all dependencies in package.json using category pattern (Pattern 1)
# Manually edit package.json with researched versions
```

**Step 4: Fresh Install**
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# This generates new package-lock.json from scratch
```

**Step 5: Validation**
```bash
# Document new dependency tree
npm ls --all > dependency-tree-after.txt

# Compare trees
diff dependency-tree-before.txt dependency-tree-after.txt

# Verify reproducibility - delete and reinstall
rm -rf node_modules
npm ci --legacy-peer-deps
```

**Step 6: Audit**
```bash
# Check for security issues
npm audit

# Check for outdated dependencies
npm outdated
```

### Lock File Quality Criteria

**Good Lock File Indicators**:
- Consistent version resolution (no multiple versions of same package)
- No extraneous dependencies
- Passes `npm ci` without modification
- Contains integrity hashes for all packages
- Size reasonable (not bloated with unused packages)

**Red Flags**:
- Multiple versions of React in tree
- Hundreds of peer dependency conflicts
- Packages with security vulnerabilities
- Lock file diff shows unexpected changes

### Documentation

Create `dependency-migration.md`:
```markdown
# Dependency Lock File Regeneration

**Date**: [timestamp]
**Action**: Completely regenerated package-lock.json

## Changes Summary
- Removed old lock file with X packages
- Generated new lock file with Y packages
- Net change: +/- Z packages

## Dependency Tree Differences
[Paste relevant diff from dependency-tree comparison]

## Security Audit
[Paste npm audit summary]

## Validation
- [ ] npm ci succeeds without errors
- [ ] Build succeeds with new lock file
- [ ] Application runs correctly
- [ ] Lock file committed to git
```

### Benefits
- **Clean slate**: No legacy dependency baggage
- **Optimized tree**: npm resolves dependencies from scratch with latest algorithm
- **Security audit**: Fresh install catches outdated vulnerable packages
- **Reproducibility**: Known-good state moving forward

### Success Criteria
- [ ] Old lock file backed up
- [ ] New lock file generated successfully
- [ ] Dependency tree documented before/after
- [ ] npm ci validates reproducibility
- [ ] Build passes with new lock file
- [ ] Committed to git with clear message

---

## Pattern 8: Inline Documentation Standard

**Pattern Name**: Self-Documenting Configuration  
**Category**: Maintainability & Knowledge Transfer  
**Decision Source**: NFR Requirements Q7=D (Inline only)

### Problem
Configuration files can be opaque without documentation, but separate documentation gets out of sync. Need documentation that travels with the code.

### Solution
Inline comments in all configuration files using consistent format. No separate documentation files.

### Comment Standards

**JSON Files** (package.json, tsconfig.json):
```json
{
  "compilerOptions": {
    // [WHY] Enable full strict mode for maximum type safety
    // [IMPACT] Catches implicit any, null/undefined issues, unused variables
    // [UNIT] Created in Unit 1, enforced in Unit 2 during conversion
    "strict": true,
    
    // [WHY] Support automatic React JSX transformation (React 17+)
    // [IMPACT] No need to import React in every component file
    "jsx": "react-jsx",
    
    // [WHY] Enable @/ path imports for cleaner relative paths
    // [EXAMPLE] import { Flight } from '@/services/Flight'
    // [UNIT] Available in Unit 2 for TypeScript conversion
    "baseUrl": "./src",
    "paths": { "@/*": ["./*"] }
  }
}
```

**Comment Format**:
- `[WHY]` - Explains rationale for configuration choice
- `[IMPACT]` - Describes what this setting affects
- `[UNIT]` - Indicates which unit created/uses this setting
- `[EXAMPLE]` - Shows concrete usage example
- `[NOTE]` - Additional context or warnings

**Dockerfile**:
```dockerfile
# ==============================================================================
# [STAGE] Build Stage - Compile TypeScript and bundle React application
# [WHY] Separate build from runtime to reduce final image size
# ==============================================================================
FROM node:18.20.2-alpine AS builder

# [WHY] Pin exact Node and npm versions for reproducible builds across environments
# [IMPACT] Ensures CI/CD, local, and production use identical tooling
RUN npm install -g npm@10.5.0

# [WHY] Use npm ci instead of npm install for reproducible dependency installation
# [IMPACT] Fails if package.json and package-lock.json are out of sync (catches errors early)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit
```

**.npmrc**:
```ini
# [WHY] Use legacy peer dependency resolution to handle conflicts
# [CONTEXT] React 18 + Mantine v6 + OpenTelemetry have peer dep mismatches
# [UNIT] Set in Unit 1, may be removed in Unit 3 after Mantine v7 upgrade
# [ALTERNATIVE] Could use npm overrides, but adds complexity for marginal benefit
legacy-peer-deps=true
```

**package.json** (using _comments field):
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  },
  "_comments": {
    "type-check": "[UNIT] Added in Unit 1 for TypeScript validation. [WHY] Enables IDE and CI/CD to check types without full build. [USAGE] Run before commits to catch type errors early.",
    "legacyPeerDeps": "[WHY] React 18, Mantine v6, and OpenTelemetry have peer dependency conflicts. [ALTERNATIVE] Could use npm overrides, but deferred to Unit 3. [IMPACT] See peer-dependency-warnings.md for full conflict list."
  }
}
```

### Documentation Locations

| Configuration | Comment Approach | Example |
|---------------|------------------|---------|
| **JSON files** | Inline // or _comments field | tsconfig.json, package.json |
| **Dockerfile** | # comments above each section | Multi-line explanations |
| **.npmrc** | # comments for each setting | One comment per config line |
| **Bash scripts** | # comments and function docs | If any scripts created |

### README.md Updates

Update project README with:
```markdown
## Configuration Files

This project uses inline documentation in configuration files. Key files:

- **`tsconfig.json`** - TypeScript compiler configuration (strict mode enabled)
- **`package.json`** - Dependencies and build scripts (see `_comments` field for rationale)
- **`Dockerfile`** - Multi-stage Docker build (see inline comments for optimization explanations)
- **`.npmrc`** - npm behavioral flags (legacy-peer-deps enabled)

All configuration decisions are documented inline. Review file comments for rationale.
```

### Benefits
- **No separate docs**: Documentation lives with code
- **Always up-to-date**: Comments updated when config changes
- **Grep-able**: Can search comments for keywords
- **Self-contained**: New developers read configs and understand immediately
- **Low maintenance**: No separate doc files to keep in sync

### Anti-Patterns to Avoid
- ❌ Separate `docs/configuration.md` that duplicates inline comments
- ❌ Comments that just restate what code does ("strict: true enables strict mode")
- ❌ No comments at all (assumes readers know why choices made)
- ❌ Over-commenting obvious settings
- ❌ Outdated comments that contradict actual configuration

### Success Criteria
- [ ] Every configuration file has inline comments
- [ ] Comments explain WHY, not just WHAT
- [ ] No separate configuration documentation files created
- [ ] README.md points developers to inline docs
- [ ] New developer can understand config choices from comments alone

---

## Pattern Integration

### How Patterns Work Together

1. **Pattern 1 → Pattern 7**: Category updates (Pattern 1) combined with clean lock regeneration (Pattern 7) ensure organized, reproducible dependency updates

2. **Pattern 2 → Pattern 4**: TypeScript validation (Pattern 2) feeds into build validation (Pattern 4) to prove entire toolchain works

3. **Pattern 3 → Pattern 8**: Peer dependency decisions (Pattern 3) documented using inline comments (Pattern 8)

4. **Pattern 5 → Pattern 6**: Docker modernization (Pattern 5) uses root-level config organization (Pattern 6)

5. **Pattern 4 → Unit 2**: Full validation (Pattern 4) guarantees Unit 2 starts on solid foundation

### Pattern Application Sequence

```
Unit 1 Execution Flow:

1. Apply Pattern 7 (Clean Lock) - Delete old lock file and node_modules
2. Apply Pattern 1 (Category Updates) - Update deps by category
3. Apply Pattern 3 (Peer Deps) - Handle conflicts with --legacy-peer-deps
4. Apply Pattern 2 (TypeScript Validation) - Create tsconfig + convert Functions.ts
5. Apply Pattern 6 (Root Config) - Organize all configs in root
6. Apply Pattern 8 (Inline Docs) - Add comments to all config files
7. Apply Pattern 5 (Docker) - Modernize Dockerfile
8. Apply Pattern 4 (Full Validation) - Comprehensive 4-tier validation
9. Handoff to Unit 2 ✅
```

---

## Summary

These 8 patterns ensure Unit 1 delivers a reliable, reproducible, well-documented foundation for Units 2 and 3:

| Pattern | Focus | Key Benefit |
|---------|-------|-------------|
| 1. Category Updates | Dependency sequencing | Risk mitigation through grouped updates |
| 2. TS Validation | Toolchain proof | Unit 2 starts with confidence in TypeScript setup |
| 3. Peer Dep | Pragmatic resolution | Fast execution with documented deferral strategy |
| 4. Full Validation | Quality assurance | Comprehensive verification before handoff |
| 5. Docker Modernization | Production readiness | Reproducible, optimized container builds |
| 6. Root Config | Organization | Simple, discoverable configuration structure |
| 7. Clean Lock | Reproducibility | Fresh dependency tree without legacy baggage |
| 8. Inline Docs | Maintainability | Self-documenting configs that stay current |

**All patterns are actionable in Code Generation stage.**
