# Logical Components - Unit 1

**Unit**: Unit 1 - Dependency Updates & Configuration  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-09  

---

## Executive Summary

This document defines the logical infrastructure components that Unit 1 establishes and configures. Unlike functional components (React components, services), these are the foundational systems that enable compilation, type checking, dependency management, and deployment.

---

## Component Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Developer Workstation                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐      ┌──────────────────┐    ┌─────────────────┐ │
│  │   IDE Layer     │◄────►│  TypeScript      │◄──►│   Dev Server    │ │
│  │  (IntelliSense) │      │  Compiler        │    │  (react-scripts)│ │
│  └─────────────────┘      └──────────────────┘    └─────────────────┘ │
│           │                        │                        │           │
│           │                        ▼                        │           │
│           │               ┌──────────────────┐             │           │
│           └──────────────►│  Build System    │◄────────────┘           │
│                           │   Orchestrator   │                          │
│                           └──────────────────┘                          │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Dependency Resolution Layer                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐      ┌───────────────┐       ┌──────────────────┐   │
│  │  npm Client  │◄────►│   npm         │◄─────►│  package-lock    │   │
│  │  (v10.5.0)   │      │   Registry    │       │  .json           │   │
│  └──────────────┘      └───────────────┘       └──────────────────┘   │
│         │                                               │               │
│         └───────────────────┬───────────────────────────┘               │
│                             ▼                                            │
│                    ┌─────────────────┐                                  │
│                    │  node_modules/  │                                  │
│                    │  (22 packages)  │                                  │
│                    └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Deployment Layer                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Docker Multi-Stage Build                     │    │
│  │  ┌──────────────────┐           ┌──────────────────────┐      │    │
│  │  │  Builder Stage   │   build/  │   Runtime Stage      │      │    │
│  │  │  (Node 18 +npm)  │─────────►│   (NGINX 1.27)       │      │    │
│  │  └──────────────────┘           └──────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Category 1: Build System Components

### Component 1.1: TypeScript Compiler

**Purpose**: Transpile TypeScript (.ts/.tsx) to JavaScript and perform type checking

**Technology**: TypeScript 5.x (latest stable)

**Configuration**: `tsconfig.json` (root)

**Responsibilities**:
- Parse TypeScript syntax in .ts and .tsx files
- Enforce strict mode type checking rules
- Generate type declarations (.d.ts files)
- Transpile TypeScript to ES2020 JavaScript
- Provide type information to IDEs for IntelliSense
- Validate type safety across entire codebase

**Interfaces**:
- **Input**: `.ts`, `.tsx` source files in `src/`
- **Output**: 
  - JavaScript code (transpiled)
  - `.d.ts` type declaration files
  - Source maps for debugging
- **Configuration**: `tsconfig.json`
- **CLI**: `tsc --noEmit` (validation only), `tsc` (full compilation)

**Quality Attributes**:
- **Performance**: Type check entire codebase in < 5 seconds (52 files)
- **Strictness**: Full strict mode enabled (as per Pattern 2)
- **Compatibility**: Works with react-scripts build system

**Integration Points**:
- IDE (VS Code, WebStorm) - real-time type checking
- react-scripts - production build compilation
- npm scripts - `npm run type-check` for validation

**Health Indicators**:
- ✅ Healthy: `tsc --noEmit` returns exit code 0
- ⚠️ Warning: Type errors found but build proceeds
- ❌ Unhealthy: Compiler crash or configuration error

---

### Component 1.2: React Scripts Build Orchestrator

**Purpose**: Coordinate entire build process (webpack, Babel, TypeScript, asset bundling)

**Technology**: react-scripts 5.0.1 (Create React App)

**Configuration**: `package.json` scripts section

**Responsibilities**:
- Orchestrate webpack bundling
- Manage Babel transpilation
- Integrate TypeScript compilation
- Bundle CSS and assets
- Generate optimized production build
- Run development server with hot reload
- Execute test runner (Jest)

**Build Modes**:

**Development Mode** (`npm start`):
- Fast incremental builds
- Hot module replacement (HMR)
- Source maps enabled
- No minification
- Dev server on port 3000

**Production Mode** (`npm run build`):
- Optimized bundle generation
- Minification and tree shaking
- Code splitting by route
- Asset optimization (images, fonts)
- Output to `build/` directory

**Interfaces**:
- **Input**: 
  - Source files (`src/**/*`)
  - Configuration (`tsconfig.json`, `package.json`)
  - Public assets (`public/*`)
- **Output**:
  - `build/` directory with static assets
  - `build/index.html` (entry point)
  - `build/static/js/*.js` (bundled JavaScript)
  - `build/static/css/*.css` (bundled CSS)
- **CLI**: `npm start`, `npm run build`, `npm test`

**Quality Attributes**:
- **Build Time**: < 60 seconds for clean production build
- **Bundle Size**: < 1.5MB uncompressed (reasonable for React + Mantine)
- **Reliability**: Build succeeds consistently across environments

**Integration Points**:
- TypeScript compiler (for .ts/.tsx files)
- Webpack (underlying bundler)
- Babel (JavaScript transpilation)
- Jest (testing framework)

**Health Indicators**:
- ✅ Healthy: Build completes, all assets generated
- ⚠️ Warning: Build succeeds with warnings (peer deps, unused vars)
- ❌ Unhealthy: Build fails or crashes

---

### Component 1.3: Development Server

**Purpose**: Serve application locally with hot reload during development

**Technology**: webpack-dev-server (via react-scripts)

**Configuration**: Embedded in react-scripts

**Responsibilities**:
- Serve application on `http://localhost:3000`
- Watch source files for changes
- Rebuild automatically on file changes
- Hot module replacement (instant updates without full refresh)
- Proxy API requests (configured in `setupProxy.js`)
- Display build errors in browser overlay

**Interfaces**:
- **Input**: 
  - Source files (`src/**/*`)
  - Proxy configuration (`src/setupProxy.js`)
- **Output**:
  - HTTP server on port 3000
  - WebSocket connection for HMR
- **CLI**: `npm start`

**Quality Attributes**:
- **Startup Time**: < 15 seconds to ready state
- **Hot Reload**: < 2 seconds from save to browser update
- **Stability**: No crashes during normal development

**Integration Points**:
- React Scripts orchestrator
- TypeScript compiler (watches .ts files)
- Backend API (via proxy)

**Health Indicators**:
- ✅ Healthy: Server running, accessible on port 3000, no console errors
- ⚠️ Warning: Server running with compilation warnings
- ❌ Unhealthy: Server crash, port conflict, or proxy errors

---

## Component Category 2: Dependency Resolution Components

### Component 2.1: npm Client

**Purpose**: Install, manage, and resolve npm package dependencies

**Technology**: npm 10.5.0 (pinned version)

**Configuration**: `.npmrc`, `package.json` installConfig

**Responsibilities**:
- Fetch packages from npm registry
- Resolve dependency trees
- Handle peer dependency conflicts
- Generate `package-lock.json` for reproducibility
- Install packages to `node_modules/`
- Audit packages for security vulnerabilities

**Key Configuration Settings**:
```ini
# .npmrc
legacy-peer-deps=true  # Handle peer dependency conflicts pragmatically
```

**Commands Used**:
- `npm install --legacy-peer-deps` - Install dependencies with conflict resolution
- `npm ci --legacy-peer-deps` - Clean install from lock file (CI/Docker)
- `npm audit` - Check for security vulnerabilities
- `npm outdated` - Check for newer versions
- `npm ls` - Display dependency tree

**Interfaces**:
- **Input**: 
  - `package.json` (dependency manifest)
  - `package-lock.json` (locked versions)
  - `.npmrc` (npm config)
- **Output**:
  - `node_modules/` directory with all packages
  - Updated `package-lock.json` (if using npm install)
- **External**: npm registry (https://registry.npmjs.org)

**Quality Attributes**:
- **Reproducibility**: `npm ci` produces identical `node_modules/` every time
- **Performance**: Install completes in < 2 minutes (22 dependencies + transitive)
- **Reliability**: No network failures or registry timeouts

**Integration Points**:
- npm Registry (package source)
- package-lock.json (reproducibility)
- Docker builder stage (npm ci)

**Health Indicators**:
- ✅ Healthy: Install succeeds, no critical security issues
- ⚠️ Warning: Peer dependency warnings, moderate security issues
- ❌ Unhealthy: Install fails, critical security vulnerabilities

---

### Component 2.2: Package Lock File (package-lock.json)

**Purpose**: Lock exact dependency versions for reproducible builds

**Technology**: npm lockfile v3 format

**Location**: `package-lock.json` (root)

**Responsibilities**:
- Record exact version of every package installed
- Store integrity hashes (SHA-512) for security
- Document resolved peer dependencies
- Enable reproducible builds via `npm ci`
- Prevent unexpected version changes

**Structure**:
```json
{
  "name": "flyfast-webui",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-...",
      "dependencies": { ... },
      "peerDependencies": { ... }
    }
  }
}
```

**Key Properties**:
- **Version Locking**: Exact versions for all packages (not ranges)
- **Integrity**: SHA-512 hash for every package (tamper detection)
- **Resolution**: Documents how conflicts were resolved

**Management Strategy** (Pattern 7):
- **Unit 1**: Regenerate completely (clean slate)
- **Future Updates**: Conservative updates (preserve structure)
- **Validation**: Always run `npm ci` to verify reproducibility

**Interfaces**:
- **Input**: `package.json` dependency specifications
- **Output**: Exact versions for npm client to install
- **Consumers**: npm client, Docker builder, CI/CD pipelines

**Quality Attributes**:
- **Completeness**: All transitive dependencies documented
- **Consistency**: No multiple versions of same package (where avoidable)
- **Security**: No packages with known vulnerabilities

**Health Indicators**:
- ✅ Healthy: Validates with `npm ci`, no security issues
- ⚠️ Warning: Peer dependency conflicts documented
- ❌ Unhealthy: Corrupted lock file, validation fails

---

### Component 2.3: node_modules Directory

**Purpose**: Store all installed npm packages for runtime and build

**Technology**: npm package installation directory

**Location**: `node_modules/` (root, gitignored)

**Responsibilities**:
- Provide runtime dependencies for application code
- Provide build-time dependencies for compilation
- Provide development dependencies for tooling
- Enable module resolution for import statements

**Structure**:
```
node_modules/
├── react/                    # Direct dependency
│   ├── package.json
│   ├── index.js
│   └── ...
├── react-dom/                # Direct dependency
├── @mantine/                 # Scoped packages
│   ├── core/
│   └── hooks/
├── typescript/               # Build-time dependency
└── [~400 total packages]     # All transitive dependencies
```

**Size Characteristics**:
- **~400-500 packages** total (22 direct + transitive)
- **~200-300 MB** disk space
- **Excluded from git** (via .gitignore)
- **Regenerated from package-lock.json** in CI/Docker

**Management**:
- **Creation**: `npm install` or `npm ci`
- **Deletion**: `rm -rf node_modules` (safe, regenerable)
- **Validation**: Ensure all imports resolve correctly

**Interfaces**:
- **Input**: package-lock.json specifies what to install
- **Output**: Provides packages for require() and import statements
- **Consumers**: TypeScript compiler, webpack, React code, dev server

**Quality Attributes**:
- **Completeness**: All required packages present
- **Consistency**: Matches package-lock.json exactly (when using npm ci)
- **Cleanliness**: No extraneous packages

**Health Indicators**:
- ✅ Healthy: All imports resolve, no missing dependencies
- ⚠️ Warning: Extraneous packages, multiple versions of same lib
- ❌ Unhealthy: Missing packages, corrupted installations

---

## Component Category 3: Development Environment Components

### Component 3.1: IDE Integration Layer

**Purpose**: Provide real-time type checking, IntelliSense, and code navigation in IDEs

**Technology**: TypeScript Language Service (via IDE extensions)

**Supported IDEs**:
- Visual Studio Code (most common)
- WebStorm / IntelliJ IDEA
- Any IDE with TypeScript support

**Responsibilities**:
- Real-time type checking in editor
- Autocomplete for types, functions, components
- Go to definition navigation
- Find all references
- Inline error squiggles
- Quick fix suggestions
- Import auto-completion

**Configuration**:
- **Primary**: `tsconfig.json` (compiler options, paths)
- **Secondary**: `.vscode/settings.json` (if project-specific settings needed)

**Provided Features**:

**Type Checking**:
```typescript
// Real-time error detection
const name: string = 123; // ❌ Error: Type 'number' is not assignable to type 'string'
```

**IntelliSense**:
```typescript
import { Flight } from '@/services/Flight';
// IDE shows autocomplete for Flight methods
```

**Path Resolution**:
```typescript
// tsconfig paths enable @/ imports
import { functions } from '@/services/Functions';
// IDE resolves to src/services/Functions.ts
```

**Interfaces**:
- **Input**: 
  - Source files (`src/**/*.ts`, `src/**/*.tsx`)
  - `tsconfig.json` configuration
  - Type declarations (`node_modules/@types/**`)
- **Output**:
  - Real-time diagnostics in editor
  - Autocomplete suggestions
  - Navigation capabilities

**Quality Attributes**:
- **Responsiveness**: Type checking updates within 1-2 seconds of typing
- **Accuracy**: Matches `tsc --noEmit` output exactly
- **Completeness**: All project types and node_modules types available

**Integration Points**:
- TypeScript compiler (same tsconfig)
- node_modules/@types packages
- IDE extensions (language server protocol)

**Health Indicators**:
- ✅ Healthy: IntelliSense works, errors show immediately
- ⚠️ Warning: Slow IntelliSense, out-of-sync with compiler
- ❌ Unhealthy: No IntelliSense, IDE can't find tsconfig

---

### Component 3.2: Type Checking Scripts

**Purpose**: Run TypeScript type checking independent of build system

**Technology**: TypeScript compiler in validation mode

**Configuration**: `package.json` scripts

**Scripts Defined**:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

**Responsibilities**:
- Validate types without emitting JavaScript
- Provide fast feedback loop for developers
- Enable CI/CD pipeline type checking
- Support pre-commit hooks for type validation

**Use Cases**:

**Pre-commit Type Check**:
```bash
# Before committing code
npm run type-check
# Exit code 0 = no errors, safe to commit
# Exit code 1+ = errors found, fix before committing
```

**Watch Mode Development**:
```bash
# Run in separate terminal during development
npm run type-check:watch
# Watches for file changes, reports errors continuously
```

**CI/CD Pipeline**:
```yaml
# In CI/CD pipeline
- run: npm run type-check
  name: Validate TypeScript types
```

**Interfaces**:
- **Input**: All `.ts` and `.tsx` files in `src/`
- **Output**: Console output with errors/warnings, exit code
- **Configuration**: Uses `tsconfig.json`

**Quality Attributes**:
- **Speed**: < 5 seconds for 52 files
- **Accuracy**: Catches all type errors that would fail in build
- **Integration**: Works in any environment (local, CI, Docker)

**Benefits Over Build-Only Checking**:
- Faster than full build (no bundling, no asset processing)
- Focuses solely on type safety
- Can run in watch mode for continuous feedback
- Exit code enables automation

**Health Indicators**:
- ✅ Healthy: Exit code 0, no errors reported
- ⚠️ Warning: Warnings reported but exit code 0
- ❌ Unhealthy: Exit code > 0, errors reported

---

## Component Category 4: Deployment Components

### Component 4.1: Docker Multi-Stage Build

**Purpose**: Create reproducible, optimized container images for deployment

**Technology**: Docker 20+, multi-stage build pattern

**Configuration**: `Dockerfile` (root)

**Architecture**:

```
┌────────────────────────────────────────────────────────────────┐
│                       Builder Stage                             │
│  Base: node:18.20.2-alpine                                     │
│                                                                 │
│  1. Install npm 10.5.0 (pinned)                               │
│  2. Copy package*.json                                         │
│  3. Run npm ci --legacy-peer-deps (reproducible install)      │
│  4. Copy source code                                           │
│  5. Run npm run build (compile TS + bundle React)            │
│  6. Prune to production dependencies only                      │
│                                                                 │
│  Output: /app/build/ directory with compiled assets           │
└────────────────────────────────────────────────────────────────┘
                              │
                              │ COPY --from=builder /app/build
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       Runtime Stage                             │
│  Base: nginx:1.27.0-alpine                                     │
│                                                                 │
│  1. Install curl (for health checks)                          │
│  2. Copy compiled assets from builder stage                    │
│  3. Copy NGINX configuration                                   │
│  4. Configure health check endpoint                            │
│  5. Expose port 80                                             │
│  6. Start NGINX server                                         │
│                                                                 │
│  Output: Running container serving static assets              │
└────────────────────────────────────────────────────────────────┘
```

**Responsibilities**:
- **Builder Stage**:
  - Compile TypeScript to JavaScript
  - Bundle React application with webpack
  - Optimize assets (minify, tree-shake, code-split)
  - Generate production build in `/app/build`
  
- **Runtime Stage**:
  - Serve static files with NGINX
  - Handle HTTP requests
  - Respond to health checks
  - Provide fast, efficient serving

**Key Optimizations** (Pattern 5):

1. **Multi-Stage**: Reduces final image by ~500MB (no node_modules in runtime)
2. **Version Pinning**: `node:18.20.2-alpine`, `npm@10.5.0` ensure reproducibility
3. **Layer Caching**: `package*.json` copied before source for better caching
4. **npm ci**: Uses locked versions from package-lock.json
5. **Alpine Base**: Minimal base image reduces size and attack surface
6. **Health Check**: Enables orchestration (Kubernetes, Docker Swarm) to monitor health

**Build Command**:
```bash
docker build -t flyfast-webui:latest .
```

**Run Command**:
```bash
docker run -p 3000:80 --name flyfast flyfast-webui:latest
```

**Interfaces**:
- **Input**:
  - Source code (`src/`)
  - Dependency manifests (`package*.json`)
  - NGINX config (`default.conf.template`)
  - `Dockerfile`
- **Output**:
  - Docker image (tagged `flyfast-webui:latest`)
  - Running container serving on port 80

**Quality Attributes**:
- **Build Time**: < 5 minutes (clean build)
- **Image Size**: < 100 MB (NGINX + static assets)
- **Reproducibility**: Same commit produces identical image
- **Security**: Minimal attack surface (no Node.js in runtime)

**Health Check Configuration**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

**Integration Points**:
- npm client (dependency installation)
- TypeScript compiler (compilation in builder)
- Build system (webpack bundling)
- NGINX (static file serving)

**Health Indicators**:
- ✅ Healthy: Build succeeds, container runs, health check passes
- ⚠️ Warning: Build slow, large image size
- ❌ Unhealthy: Build fails, container crashes, health check fails

---

### Component 4.2: NGINX Static File Server

**Purpose**: Serve compiled React application in production

**Technology**: NGINX 1.27.0 (Alpine)

**Configuration**: `default.conf.template`

**Responsibilities**:
- Serve static files from `/usr/share/nginx/html`
- Handle client-side routing (SPA fallback to index.html)
- Compress responses with gzip
- Set appropriate cache headers
- Log access and errors

**Configuration Example**:
```nginx
server {
    listen 80;
    server_name ${NGINX_HOST};
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing: fallback to index.html for client-side routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Interfaces**:
- **Input**: Static files in `/usr/share/nginx/html` (from Docker builder stage)
- **Output**: HTTP responses on port 80
- **Configuration**: `default.conf.template` with environment variable substitution

**Quality Attributes**:
- **Performance**: Serves static files with minimal overhead
- **Reliability**: NGINX is battle-tested for static file serving
- **Simplicity**: No application server needed (just static files)

**Health Indicators**:
- ✅ Healthy: HTTP 200 for root path, assets load correctly
- ⚠️ Warning: Slow response times
- ❌ Unhealthy: HTTP errors, NGINX crash

---

## Component Category 5: Configuration Components

### Component 5.1: TypeScript Configuration (tsconfig.json)

**Purpose**: Define TypeScript compiler behavior and project structure

**Location**: `tsconfig.json` (root)

**Responsibilities**:
- Enable strict mode type checking
- Configure module resolution
- Define JSX transformation
- Set up path aliases
- Specify include/exclude patterns

**Key Settings** (from Pattern 2):
```json
{
  "compilerOptions": {
    "strict": true,                    // All strict checks enabled
    "target": "ES2020",                // Modern JavaScript target
    "lib": ["ES2020", "DOM"],          // Include DOM types
    "jsx": "react-jsx",                // React 17+ JSX transform
    "module": "ESNext",                // ES modules
    "moduleResolution": "node",        // Node.js resolution
    "baseUrl": "./src",                // Base for path mapping
    "paths": { "@/*": ["./*"] },       // @/ alias for imports
    "esModuleInterop": true,           // CommonJS interop
    "skipLibCheck": true,              // Skip .d.ts checking (performance)
    "isolatedModules": true,           // Babel compatibility
    "resolveJsonModule": true          // Import JSON files
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "build"]
}
```

**Interfaces**:
- **Consumers**: 
  - TypeScript compiler (tsc)
  - IDEs (VS Code, WebStorm)
  - react-scripts build system
  - Type checking scripts
- **Configuration**: Inline comments (Pattern 8)

**Quality Attributes**:
- **Strictness**: Maximum type safety with full strict mode
- **Compatibility**: Works with react-scripts and IDEs
- **Maintainability**: Well-commented inline documentation

---

### Component 5.2: Package Configuration (package.json)

**Purpose**: Define project metadata, dependencies, and build scripts

**Location**: `package.json` (root)

**Responsibilities**:
- List all dependencies with version ranges
- Define npm scripts for building, testing, type-checking
- Configure project metadata (name, version, license)
- Set npm behavioral flags (installConfig)
- Document configuration choices (in _comments field)

**Key Sections**:

**Dependencies** (22 direct packages):
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@mantine/core": "^6.0.21",
    "typescript": "^5.x",
    ...
  }
}
```

**Scripts**:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch"
  }
}
```

**Configuration**:
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

**Interfaces**:
- **Consumers**:
  - npm client (dependency installation)
  - Developers (npm scripts)
  - CI/CD pipelines (build automation)
  - Docker (builder stage)

---

### Component 5.3: npm Configuration (.npmrc)

**Purpose**: Configure npm client behavior for dependency installation

**Location**: `.npmrc` (root, optional if installConfig works)

**Responsibilities**:
- Enable legacy peer dependency resolution
- Configure registry settings (if needed)
- Set npm behavioral flags

**Content**:
```ini
# Enable legacy peer dependency resolution
# Required for React 18 + Mantine v6 + OpenTelemetry compatibility
legacy-peer-deps=true
```

**Interfaces**:
- **Consumer**: npm client
- **Alternative**: `installConfig` in package.json

---

## Component Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Dependency Graph                    │
└─────────────────────────────────────────────────────────────────┘

IDE Integration ──────► TypeScript Compiler ──────► node_modules
      │                        │                          ▲
      │                        ▼                          │
      └──────────────► Build Orchestrator ────────────────┘
                              │
                              ├──────► Dev Server
                              │
                              ├──────► Type Check Scripts
                              │
                              └──────► Docker Build ──────► NGINX Server

npm Client ──────► Package Lock ──────► node_modules
     │                                        │
     └────────────────────────────────────────┘

Configs (tsconfig, package.json, .npmrc) ──────► All Components
```

**Key Dependencies**:
1. Everything depends on `node_modules` (must be installed first)
2. TypeScript compiler reads `tsconfig.json`
3. Build orchestrator uses TypeScript, webpack, Babel
4. Docker build uses npm client, build orchestrator
5. IDE integration uses TypeScript compiler + tsconfig.json

---

## Component Lifecycle

### Unit 1 Initialization Sequence

```
1. Clean Environment
   ├─ Delete node_modules/
   ├─ Delete package-lock.json
   └─ npm cache clean --force

2. Create Configurations
   ├─ Create tsconfig.json (Pattern 2)
   ├─ Create/update .npmrc (Pattern 3)
   └─ Update package.json scripts

3. Install Dependencies (Pattern 1)
   ├─ Update package.json by category
   ├─ npm install --legacy-peer-deps
   └─ Generate new package-lock.json (Pattern 7)

4. Validate TypeScript Toolchain (Pattern 2)
   ├─ Convert Functions.js to Functions.ts
   ├─ npm run type-check (should pass)
   └─ npm run build (should succeed)

5. Update Docker Configuration (Pattern 5)
   ├─ Update Dockerfile with optimizations
   ├─ Test docker build
   └─ Test container run

6. Full Validation (Pattern 4)
   ├─ Tier 1: Compilation
   ├─ Tier 2: Dev Server
   ├─ Tier 3: Application Load
   └─ Tier 4: Navigation & Functional

7. Handoff to Unit 2 ✅
```

### Runtime Component Activation

**Development (`npm start`)**:
```
1. npm Client loads node_modules (already installed)
2. Build Orchestrator (react-scripts) initializes
3. TypeScript Compiler activates (watches .ts files)
4. Dev Server starts on port 3000
5. IDE Integration activates (if IDE open)
6. Type Check Scripts available (manual execution)
```

**Production Build (`npm run build`)**:
```
1. Build Orchestrator initializes
2. TypeScript Compiler transpiles all .ts/.tsx files
3. Webpack bundles JavaScript
4. Webpack processes CSS and assets
5. Output written to build/ directory
6. NGINX (if in Docker) serves files from build/
```

---

## Summary

These 5 categories of logical components form the foundation that Unit 1 establishes:

| Category | Components | Purpose |
|----------|-----------|---------|
| **Build System** | TypeScript Compiler, react-scripts, Dev Server | Compile and bundle application |
| **Dependency Resolution** | npm Client, package-lock.json, node_modules | Install and manage packages |
| **Development Environment** | IDE Integration, Type Check Scripts | Support developer workflow |
| **Deployment** | Docker Multi-Stage, NGINX | Package and serve in production |
| **Configuration** | tsconfig.json, package.json, .npmrc | Define system behavior |

**All components are configured in Unit 1 and used throughout Units 2 and 3.**
