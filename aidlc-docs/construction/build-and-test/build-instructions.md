# Build Instructions

## Prerequisites

### Build Tool
- **Tool**: npm (Node Package Manager)
- **Version**: 8.x or higher
- **React Scripts**: 5.0.1 (Create React App)

### Dependencies
- Node.js 16.x or higher
- TypeScript 5.9.3
- React 18.3.1
- Mantine 7.17.8 (`@mantine/core`, `@mantine/dates`, `@mantine/hooks`)
- All npm dependencies listed in package.json

### Environment Variables
```bash
# Optional: API endpoints (defaults configured if not provided)
REACT_APP_API_BASE_URL=http://localhost:8080

# Optional: OpenTelemetry tracing configuration
REACT_APP_TRACING_ENABLED=true
```

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: Minimum 4GB RAM recommended
- **Disk Space**: ~500MB for node_modules and build artifacts
- **Network**: Internet connection required for dependency installation

---

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

**Expected Output**:
```
added [X] packages, and audited [Y] packages in [Z]s
found 0 vulnerabilities
```

**Note**: Some vulnerability warnings from transitive dependencies are expected with Create React App and do not affect build success.

---

### 2. Configure Environment

**Development** (default configuration):
```bash
# No additional configuration needed
# Uses setupProxy.ts for local API proxying
```

**Production**:
```bash
# Set production API endpoint
export REACT_APP_API_BASE_URL=https://api.flyfast.example.com

# Optionally disable tracing in production
export REACT_APP_TRACING_ENABLED=false
```

---

### 3. TypeScript Type-Check

Before building, validate TypeScript compilation:

```bash
npm run type-check
```

**Expected Output**:
```
> tsc --noEmit
[No output = success, 0 errors]
```

**Verify**:
- Exit code 0
- No error messages in console
- All 27 TypeScript/TSX files pass strict mode validation

---

### 4. Build All Units

```bash
npm run build
```

**Expected Output**:
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:

   123.71 kB  build/static/js/main.15dfbd83.js
   46.49 kB   build/static/js/844.3eade7c7.chunk.js
   32.36 kB   build/static/css/main.fc7488d3.css
   10.05 kB   build/static/js/744.8041736b.chunk.js
  ...

The build folder is ready to be deployed.
```

**Build Time**: ~30-60 seconds (varies by system)

---

### 5. Verify Build Success

#### Check Build Artifacts
```bash
ls -la build/
```

**Expected Files**:
- `build/index.html` - Main HTML entry point
- `build/static/js/` - JavaScript bundles
- `build/static/css/` - CSS stylesheets
- `build/manifest.json` - PWA manifest
- `build/robots.txt` - SEO configuration

#### Verify Bundle Sizes
Main bundle should be ~124 KB (gzipped) and CSS bundle ~32 KB after Mantine v7 native styles migration.

#### Check for Warnings
Acceptable warnings:
- "Browserslist: caniuse-lite is outdated" (non-blocking)
- "TypeScript 5.9.3 not officially supported by eslint" (non-breaking)

Unacceptable errors:
- Compilation errors
- Module not found errors
- Out of memory errors

---

## Troubleshooting

### Build Fails with Dependency Errors

**Symptom**:
```
Error: Cannot find module 'react'
npm ERR! code ELIFECYCLE
```

**Cause**: Missing or corrupted node_modules

**Solution**:
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Retry build
npm run build
```

---

### Build Fails with TypeScript Compilation Errors

**Symptom**:
```
TS2322: Type 'string' is not assignable to type 'number'
```

**Cause**: Type errors in converted TypeScript files

**Solution**:
1. Run type-check to see all errors:
   ```bash
   npm run type-check
   ```
2. Review error locations
3. Fix type mismatches in source files
4. Rerun type-check until 0 errors
5. Retry build

---

### Build Fails with Out of Memory Error

**Symptom**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Cause**: Insufficient memory allocation for Node.js

**Solution**:
```bash
# Windows
set NODE_OPTIONS=--max_old_space_size=4096
npm run build

# Linux/macOS
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

---

### Build Hangs or Takes Too Long

**Symptom**: Build process runs for >5 minutes without completing

**Cause**: File system issues, background processes, or disk I/O bottleneck

**Solution**:
1. Stop build (Ctrl+C)
2. Close resource-intensive applications
3. Check disk space: `df -h` (Linux) or `dir` (Windows)
4. Restart build with verbose output:
   ```bash
   npm run build --verbose
   ```

---

## Build Verification Checklist

- [ ] npm install completed successfully
- [ ] npm run type-check passed with 0 errors
- [ ] npm run build completed with "Compiled successfully!"
- [ ] build/ folder exists with index.html
- [ ] build/static/js/ contains main bundle and chunks
- [ ] Main bundle size is approximately 124 KB (gzipped)
- [ ] No compilation errors in console output
- [ ] Acceptable warnings only (browserslist, eslint)

---

## Next Steps

After successful build:
1. Proceed to **Unit Test Execution** (see unit-test-instructions.md)
2. Then **Integration Tests** (see integration-test-instructions.md)
3. Optionally **Performance Tests** (see performance-test-instructions.md)
