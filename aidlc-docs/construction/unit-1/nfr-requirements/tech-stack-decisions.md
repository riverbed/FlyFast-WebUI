# Tech Stack Decisions - Unit 1

**Unit**: Unit 1 - Dependency Updates & Configuration  
**Phase**: CONSTRUCTION  
**Stage**: NFR Requirements  
**Date Generated**: 2026-03-09  

---

## Executive Summary

This document captures specific technology stack decisions made for Unit 1, including exact dependency versions, configuration files, and implementation approaches. These decisions are based on the NFR Requirements analysis and answer choices provided.

---

## Decision Framework

| Dimension | Decision | Reasoning |
|-----------|----------|-----------|
| Dependency Versions | LTS/Stable preference (Answer Q2=B) | Long-term support and stability prioritized |
| Peer Dependencies | Don't care / --legacy-peer-deps acceptable (Answer Q1=D) | Pragmatic approach to resolve conflicts |
| TypeScript Config | Full strict mode (Answer Q3=A) | Maximum type safety for codebase conversion |
| Build Performance | No specific target, optimize if needed (Answer Q4=D) | Pragmatic approach - measure if problems emerge |
| IDE Support | Practical / standard configuration (Answer Q5=B) | Balance capability with simplicity |
| Lock File | Strict regenerate (Answer Q6=A) | Clean slate for reproducible builds |
| Documentation | Inline only (Answer Q7=D) | Self-documenting configuration preferred |
| Metrics Baseline | Skip baseline (Answer Q8=D) | Measure after changes if concerns arise |

---

## Dependency Version Decisions

### Current Dependencies (From package.json - to be updated)

All 22 direct dependencies will be analyzed for latest stable versions:

```
Research & Update Requirements:
- react: 18.3.1 → Latest stable 18.x (research compatibility)
- react-dom: 18.3.1 → Matching React version
- @mantine/core: 6.0.18 → Keep 6.x in Unit 1 (upgrade to v7 in Unit 3)
- @mantine/hooks: Latest matching @mantine/core
- axios: Latest stable version
- react-router-dom: Latest stable matching React 18
- react-carousel: Latest stable or find alternative
- react-datepicker: Latest stable or consider Mantine alternative
- react-icons: Latest stable
- [Continue for all 22 dependencies]
```

### Peer Dependency Resolution

**Decision**: Accept `--legacy-peer-deps` flag if necessary to resolve conflicts between:
- React 18.x peer dependency requirements
- Mantine v6.x peer dependency requirements  
- TypeScript v5+ peer dependency requirements

**Implementation**:
```bash
npm install --legacy-peer-deps
npm ci --legacy-peer-deps  # In Docker and CI/CD
```

**Rationale**: User selected "don't care" approach (Answer Q1=D). Pragmatic resolution prioritizes getting all dependencies installed over strict peer dependency compliance. Unit 3 (Mantine v7 migration) may resolve peer conflicts naturally.

**Success Verification**:
- `npm audit` produces no critical/high severity issues
- Application builds and runs after dependency installation
- No unresolved peer dependency warnings on clean install

---

## TypeScript Configuration (tsconfig.json)

### File Location
- **Path**: `tsconfig.json` (root of project)
- **Created**: Unit 1
- **Used By**: Unit 2 (file conversion), Unit 3 (component updates)

### Full tsconfig.json Content

```json
{
  "compilerOptions": {
    // Strict Type Checking Options (Answer Q3=A: Full strict mode)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // Module Resolution
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    
    // Output
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./build",
    
    // Interop & Compatibility
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    // Resolution & Bundling
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    
    // Base URL for imports (supports @/ prefix in Unit 2)
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    },
    
    // React-specific: CRA v5 with TypeScript support
    "incremental": true,
    "tsBuildInfoFile": "./build/.tsbuildinfo"
  },
  "include": ["src"],
  "exclude": ["node_modules", "build", "dist"]
}
```

### Inline Comments (Answer Q7=D: Inline documentation)

Key comments to add within tsconfig.json:
```json
{
  "compilerOptions": {
    // All strict mode flags enabled (Answer Q3=A) - catches maximum type errors at compile time
    "strict": true,
    
    // Support modern JavaScript while maintaining compatibility
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    
    // React JSX support for .tsx files
    "jsx": "react-jsx",
    
    // IDE support: Path mapping enables autocomplete for @/ imports
    // Used in Unit 2 for cleaner import statements
    "baseUrl": "./src",
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## Package.json Updates

### Scripts (Answer Q5=B: Practical IDE support)

Add/Update scripts section:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

**Note**: `type-check` and `type-check:watch` scripts enable IDE verification outside of react-scripts build process.

### Dependencies Resolution (Answer Q6=A: Strict regenerate)

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

This configures npm to use `--legacy-peer-deps` by default if peer dependency conflicts occur.

---

## Docker Configuration Changes

### Dockerfile - npm ci (vs npm install)

**Current**: Uses `npm install` (not locked to package-lock.json)  
**Updated**: Use `npm ci` in Docker (respects package-lock.json)

```dockerfile
# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps  # Changed from npm install
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:1.27-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Rationale**: `npm ci` (clean install) respects package-lock.json exactly, ensuring Docker builds use exact same versions as development.

---

## Build System Artifacts

### Files Created/Modified in Unit 1

| File | Action | Purpose | Dependency |
|------|--------|---------|------------|
| `package.json` | Update | Bump all 22 dependency versions | Core |
| `package-lock.json` | Regenerate | Clean lock with new versions (Answer Q6=A) | Blocks Unit 2 |
| `tsconfig.json` | Create | TypeScript strict mode config (Answer Q3=A) | Blocks Unit 2 |
| `Dockerfile` | Update | Use npm ci with legacy-peer-deps flag | Supports deployment |
| `.npmrc` (optional) | Create | Document legacy-peer-deps setting | Optional |

### Package.json - Final Dependency List

**Research Required**: For each of 22 dependencies:
1. Check current version in package.json
2. Find latest stable version on npm
3. Verify compatibility with:
   - React 18.3.1
   - TypeScript latest
   - Other dependencies in package.json
4. Check for breaking changes between current and target version
5. Document notable version jumps (e.g., major version changes)

**Example Research Template**:
```
Dependency: axios
Current: 1.4.0
Latest Stable: 1.6.x
Research: 
  - Breaking changes: None documented between 1.4→1.6
  - React 18 compatibility: ✓ Compatible
  - Peer dependencies: None that conflict
Decision: → Update to 1.6.x (latest stable)
```

---

## Peer Dependency Conflict Resolution

### Expected Conflicts to Resolve

1. **TypeScript peer dependencies**: Many packages expect TypeScript as peer dep
   - Decision: Install TypeScript globally via package.json devDependencies
   
2. **React version expectations**: 
   - All Mantine packages expect React 16.8+; React 18.x compatible ✓
   
3. **react-scripts compatibility**:
   - react-scripts v5.0.1 supports React 18; may need version check

### Resolution Process

```bash
# Step 1: Install all dependencies with legacy-peer-deps
npm install --legacy-peer-deps

# Step 2: Audit for critical/high issues
npm audit

# Step 3: If issues found, suppress only if documented reason exists
npm audit --only=prod  # Check production dependencies only

# Step 4: Verify no peer dependency ERRORS (warnings acceptable)
npm ls
```

---

## Testing & Validation Criteria

### Build System Validation

- [ ] `npm install --legacy-peer-deps` completes successfully
- [ ] `npm audit` shows no CRITICAL/HIGH issues in production
- [ ] `npm run type-check` completes without errors
- [ ] `npm run build` completes successfully  
- [ ] `npm start` launches dev server without console errors
- [ ] Docker build completes successfully
- [ ] Container runs and serves application on port 80/3000

### TypeScript Configuration Validation

- [ ] All .ts/.tsx files in `src/` are recognized by TypeScript compiler
- [ ] `tsconfig.json` found and loaded by IDEs
- [ ] Strict mode flags take effect:
  - `noImplicitAny` catches missing type annotations
  - `strictNullChecks` catches null/undefined issues
  - `noUnusedLocals` catches unused variables

### Compatibility Validation

- [ ] React 18.3.1 works with all updated dependencies
- [ ] Mantine v6 (current) is compatible with all updated dependencies
  - (Note: Mantine v7 upgrade is Unit 3 responsibility)
- [ ] No console warnings about deprecated dependencies
- [ ] IDE IntelliSense works for React and Mantine types

---

## Known Issues & Mitigation

### Potential Issues

1. **Peer Dependency Conflicts** → Use `--legacy-peer-deps` (user approved)
2. **Breaking Changes in Dependencies** → Research thoroughly, test after updating
3. **TypeScript Strict Mode Breaking Existing Code** → Will be resolved in Unit 2
4. **Build Tool Incompatibility** → react-scripts v5 supports TypeScript; verify version

### Mitigation Actions

- Document all peer dependency resolutions in this file
- Test each major dependency update individually before committing
- Use git branches for dependency updates (easy rollback if issues)
- Perform full build test after each dependency update

---

## Implementation Checklist

### Unit 1 Implementation Phase

- [ ] Research all 22 dependency versions (update-research.md to track)
- [ ] Update package.json with new versions
- [ ] Create tsconfig.json with full strict mode
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Generate clean package-lock.json
- [ ] Run npm audit; document any non-critical warnings
- [ ] Verify `npm run type-check` succeeds
- [ ] Verify `npm run build` succeeds
- [ ] Verify `npm start` launches dev server
- [ ] Update Dockerfile if npm/Node version changed
- [ ] Test Docker build process
- [ ] Add inline comments to configuration files (Answer Q7=D)
- [ ] Commit all changes to git
- [ ] Document any deviations from this plan

### Validation Before Unit 2 Handoff

- [ ] Build system fully functional
- [ ] TypeScript configuration ready for file conversion
- [ ] All dependencies installed and validated
- [ ] Lock file stable and reproducible
- [ ] Ready to begin TypeScript conversion in Unit 2

---

## Decision Log

| Decision | Answer | Rationale | Impact |
|----------|--------|-----------|--------|
| Dependency versions | LTS/Stable (B) | Long-term support | Higher quality, slower updates |
| Peer dep conflicts | Don't care / legacy-peer-deps (D) | Pragmatic | Easier initial setup, may need review later |
| TypeScript strict | Full mode (A) | Maximum safety | Will require careful conversion, better long-term quality |
| Build performance | No target (D) | Pragmatic focus | Flexible, can optimize only if needed |
| IDE config | Practical (B) | Balance | Supports developers without over-configuration |
| Lock file | Strict regenerate (A) | Reproducibility | Cleaner builds, easier debugging |
| Documentation | Inline only (D) | Minimal overhead | Fast execution, relies on config comments |
| Metrics baseline | Skip (D) | Pragmatic | Measure if problems emerge |

---

## Success Criteria for Unit 1

**Unit 1 is complete when**:
1. All 22 dependencies updated to latest stable versions ✓
2. `package-lock.json` regenerated and stable ✓
3. `tsconfig.json` created with full strict mode ✓
4. `npm audit` passes (no critical/high issues) ✓
5. Build completes: `npm run build` succeeds ✓
6. Development server launches: `npm start` works ✓
7. Docker build succeeds ✓
8. TypeScript ready for Unit 2 conversion ✓
9. Inline documentation in configuration files ✓
10. All changes committed to git ✓

**When all criteria met**: Unit ready for handoff to Unit 2 TypeScript conversion
