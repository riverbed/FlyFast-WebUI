# Dependencies

## Internal Dependencies

FlyFast-WebUI is a single-package React application with no internal package dependencies. All code is contained within the `src/` directory.

**Internal Dependencies**: None (monolithic SPA)

---

## External Dependencies (npm packages)

### Production Dependencies

#### UI Framework
```
react: ^18.3.1
react-dom: ^18.3.1
```
- **Purpose**: Core React framework
- **License**: MIT
- **Critical**: Yes
- **Used By**: All components

---

#### Routing
```
react-router-dom: ^6.27.0
```
- **Purpose**: Client-side routing and navigation
- **License**: MIT
- **Critical**: Yes
- **Used By**: App.js, Search, SearchFlight, Cart, all page navigation
- **Reason**: Application navigation infrastructure

---

#### UI Component Library
```
@mantine/core: ^6.0.18
@mantine/dates: ^6.0.18
@mantine/hooks: ^6.0.18
```
- **Purpose**: Complete React component library and utilities
- **License**: MIT
- **Critical**: Yes for core, Medium for dates/hooks
- **Used By**: All form components, layouts, Search, Cart, etc.
- **Reason**: Primary UI component framework

---

#### Icons
```
react-icons: ^5.3.0
```
- **Purpose**: Icon library (Bootstrap Icons, Material Design)
- **License**: MIT
- **Critical**: No (cosmetic)
- **Used By**: Search, ApplicationHeader, TripCard
- **Reason**: Visual enhancements

---

#### OpenTelemetry - Core
```
@opentelemetry/api: ^1.9.0
@opentelemetry/resources: ^1.27.0
@opentelemetry/sdk-trace-base: ^1.27.0
@opentelemetry/sdk-trace-web: ^1.27.0
```
- **Purpose**: OpenTelemetry core SDK for web tracing
- **License**: Apache 2.0
- **Critical**: No (observability only)
- **Used By**: Tracing.js
- **Reason**: Distributed tracing infrastructure

---

#### OpenTelemetry - Exporter
```
@opentelemetry/exporter-trace-otlp-http: ^0.54.0
```
- **Purpose**: Export traces via OTLP over HTTP
- **License**: Apache 2.0
- **Critical**: No (observability only)
- **Used By**: Tracing.js
- **Reason**: Send traces to collector

---

#### OpenTelemetry - Context Management
```
@opentelemetry/context-zone: ^1.27.0
@opentelemetry/propagator-b3: ^1.27.0
```
- **Purpose**: Context management and trace propagation
- **License**: Apache 2.0
- **Critical**: No (observability only)
- **Used By**: Tracing.js
- **Reason**: Async operation tracking, distributed trace headers
- **Note**: B3 propagator commented out, using W3C default

---

#### OpenTelemetry - Instrumentation
```
@opentelemetry/instrumentation: ^0.54.0
@opentelemetry/instrumentation-document-load: ^0.41.0
@opentelemetry/instrumentation-fetch: ^0.54.0
@opentelemetry/instrumentation-user-interaction: ^0.41.0
@opentelemetry/instrumentation-xml-http-request: ^0.54.0
```
- **Purpose**: Automatic instrumentation of web APIs
- **License**: Apache 2.0
- **Critical**: No (observability only)
- **Used By**: Tracing.js
- **Reason**: Auto-instrument document load, fetch, XHR, user interactions

---

#### Development Proxy
```
http-proxy-middleware: ^3.0.3
```
- **Purpose**: Proxy API requests in development
- **License**: MIT
- **Critical**: Yes for development, not used in production
- **Used By**: setupProxy.js
- **Reason**: Avoid CORS during local development

---

#### Performance Monitoring
```
web-vitals: ^4.2.4
```
- **Purpose**: Track Core Web Vitals metrics
- **License**: Apache 2.0
- **Critical**: No (optional monitoring)
- **Used By**: reportWebVitals.js
- **Reason**: Performance measurement

---

### Development Dependencies

#### Build Tooling
```
react-scripts: ^5.0.1
```
- **Purpose**: Create React App build tooling
- **License**: MIT
- **Critical**: Yes (development and build)
- **Used By**: Build process, development server, test runner
- **Reason**: Complete build infrastructure
- **Includes**: Webpack, Babel, Jest, ESLint

---

#### Type Checking (Unused)
```
typescript: ^4
```
- **Purpose**: TypeScript compiler
- **License**: Apache 2.0
- **Critical**: No (currently unused)
- **Used By**: Nothing
- **Reason**: Listed but not actively used
- **Recommendation**: Remove or implement

---

## Dependency Relationships

### React Ecosystem Dependencies

```
React 18.3.1
  |
  +-- Application Code (components)
  |
  +-- React Router 6.27.0
  |     +-- BrowserRouter, Routes, Route
  |     +-- useNavigate, useLocation
  |
  +-- Mantine UI 6.0.18
        +-- @mantine/core (components)
        +-- @mantine/dates (DatePickerInput)
        +-- @mantine/hooks (useLocalStorage)
```

### OpenTelemetry Dependencies

```
OpenTelemetry Core
  |
  +-- @opentelemetry/api (base API)
  |
  +-- @opentelemetry/sdk-trace-web
  |     +-- @opentelemetry/sdk-trace-base
  |     +-- @opentelemetry/resources
  |
  +-- @opentelemetry/exporter-trace-otlp-http
  |
  +-- @opentelemetry/context-zone
  |
  +-- Instrumentation Packages
        +-- @opentelemetry/instrumentation
        +-- @opentelemetry/instrumentation-document-load
        +-- @opentelemetry/instrumentation-fetch
        +-- @opentelemetry/instrumentation-user-interaction
        +-- @opentelemetry/instrumentation-xml-http-request
```

---

## Dependency Risk Assessment

### Critical Dependencies (Application Cannot Function Without)

| Dependency | Risk | Reason |
|------------|------|--------|
| react | Low | Stable, well-maintained, v18 is latest |
| react-dom | Low | Stable, matches React version |
| react-router-dom | Low | Stable, v6 is current major version |
| @mantine/core | Low | Stable, actively maintained |
| react-scripts | Low | Stable, part of official Create React App |

### Important Dependencies (Functionality Degradation Without)

| Dependency | Risk | Reason |
|------------|------|--------|
| @mantine/dates | Low | Date picker functionality |
| @mantine/hooks | Low | Used for localStorage integration |
| http-proxy-middleware | Low | Dev only, mature package |

### Optional Dependencies (Can Be Removed Without Core Impact)

| Dependency | Risk | Reason |
|------------|------|--------|
| react-icons | Low | Cosmetic only |
| web-vitals | Low | Performance monitoring only |
| All OpenTelemetry packages | Low | Observability only, graceful degradation |
| typescript | None | Unused |

---

## Dependency Version Analysis

### Up-to-Date Dependencies ✅
- React 18.3.1 (latest stable)
- React Router 6.27.0 (latest)
- Mantine 6.0.18 (latest v6)
- react-scripts 5.0.1 (latest)
- OpenTelemetry packages (current stable)
- NGINX 1.27 (latest)

### Dependencies Requiring Attention ⚠️
- TypeScript ^4 (listed but unused - consider removal)

### Deprecated or End-of-Life ❌
- None

---

## Dependency Update Strategy

### Safe to Update (Patch/Minor Versions)
All dependencies are safe for patch/minor updates within their current major versions.

**Recommendation**:
```bash
npm update
```

### Major Version Updates to Consider
1. **Mantine 6.x → 7.x**
   - Check migration guide
   - Likely breaking changes in API
   - Test thoroughly before upgrading

2. **React 18.x → 19.x** (when available)
   - Follow official migration guide
   - React Router compatibility check required

### Dependencies to Remove
- **TypeScript**: Not actively used, adds unnecessary package

---

## Dependency Installation Notes

### Current Installation Command
```bash
npm install --legacy-peer-deps
```

**Reason for --legacy-peer-deps**: 
- Likely peer dependency conflicts between packages
- Should investigate and resolve for cleaner dependency tree

### Recommended Installation (Production)
```bash
npm clean-install
```
- Uses package-lock.json (immutable)
- Ensures consistent builds
- Used in Dockerfile

---

## Transitive Dependencies

### Notable Transitive Dependencies (from react-scripts)

react-scripts brings in:
- **Webpack**: Module bundler
- **Babel**: JavaScript transpiler
- **Jest**: Test framework
- **ESLint**: Code linter
- **html-webpack-plugin**: HTML generation
- **css-loader, style-loader**: CSS handling
- **Many others**: See package-lock.json

**Total Installed Packages**: ~1500+ (including all transitive dependencies)

---

## License Compliance

### License Distribution

| License | Count | Risk |
|---------|-------|------|
| MIT | Majority | Low - permissive |
| Apache 2.0 | OpenTelemetry packages | Low - permissive |
| ISC | Some utilities | Low - permissive |

**Overall License Risk**: Low

All dependencies use permissive open-source licenses compatible with commercial use.

---

## Dependency Graph Summary

```
Production Runtime
  |
  +-- React Ecosystem (6 packages)
  |     +-- react
  |     +-- react-dom
  |     +-- react-router-dom
  |     +-- @mantine/* (3 packages)
  |
  +-- Icons (1 package)
  |     +-- react-icons
  |
  +-- OpenTelemetry (10 packages)
  |     +-- Core SDK (4 packages)
  |     +-- Exporter (1 package)
  |     +-- Instrumentation (5 packages)
  |
  +-- Utilities (2 packages)
        +-- http-proxy-middleware
        +-- web-vitals

Development Build
  |
  +-- react-scripts
        +-- Brings ~1500 transitive dependencies
```

**Total Direct Dependencies**: 20 production + 2 development = 22 packages

---

## Dependency Security Audit

**Recommendation**: Run regular security audits

```bash
npm audit
```

**Current Status**: Should be evaluated but all packages are current versions which minimizes known vulnerabilities.

---

## Dependency Maintenance Recommendations

1. **Remove TypeScript** if not planning to use it
2. **Investigate --legacy-peer-deps** requirement and resolve peer dependency conflicts
3. **Run `npm audit`** regularly for security vulnerabilities
4. **Keep dependencies updated** within major versions
5. **Test thoroughly** before major version upgrades
6. **Consider Mantine 7.x migration** when stable
7. **Document** any custom dependency resolution strategies
