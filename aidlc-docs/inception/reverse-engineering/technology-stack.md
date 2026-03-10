# Technology Stack

## Programming Languages

| Language | Version | Usage | Loc | Percentage |
|----------|---------|-------|-----|------------|
| JavaScript (JSX) | ES2015+ | React components, services, utilities | Primary | ~95% |
| JSON | - | Static data, configuration | Supporting | ~3% |
| CSS | CSS3 | Styling | Supporting | ~2% |
| HTML | HTML5 | Entry template | Minimal | <1% |

**Primary Language**: JavaScript with JSX syntax extensions

---

## Frontend Framework

### React
- **Version**: 18.3.1
- **Purpose**: Core UI framework
- **Key Features Used**:
  - Functional components with hooks
  - Context API for state management
  - Suspense for code splitting
  - React.lazy() for dynamic imports
  - StrictMode for development warnings

### React DOM
- **Version**: 18.3.1
- **Purpose**: React renderer for web

---

## UI Component Library

### Mantine
- **@mantine/core**: 6.0.18
- **@mantine/dates**: 6.0.18
- **@mantine/hooks**: 6.0.18
- **Purpose**: Complete React component library
- **Components Used**:
  - Autocomplete (airport search)
  - NativeSelect (trip type, seat class)
  - DatePickerInput (travel dates)
  - Grid, Group (layouts)
  - Paper (containers)
  - LoadingOverlay (loading states)
  - Button (actions)
- **Hooks Used**:
  - useLocalStorage (cart persistence)

---

## Routing

### React Router
- **Version**: 6.27.0
- **Package**: react-router-dom
- **Purpose**: Client-side routing and navigation
- **Features Used**:
  - BrowserRouter (HTML5 history)
  - Routes and Route components
  - useNavigate hook (programmatic navigation)
  - URL search parameters
  - Lazy-loaded routes

---

## Observability

### OpenTelemetry (Web)

**Core Packages**:
- **@opentelemetry/api**: 1.9.0
- **@opentelemetry/sdk-trace-web**: 1.27.0
- **@opentelemetry/sdk-trace-base**: 1.27.0
- **@opentelemetry/resources**: 1.27.0

**Exporter**:
- **@opentelemetry/exporter-trace-otlp-http**: 0.54.0

**Context Management**:
- **@opentelemetry/context-zone**: 1.27.0

**Propagators**:
- **@opentelemetry/propagator-b3**: 1.27.0 (legacy, commented out)
- Default: W3C Trace Context

**Instrumentation Packages**:
- **@opentelemetry/instrumentation**: 0.54.0 (base)
- **@opentelemetry/instrumentation-document-load**: 0.41.0
- **@opentelemetry/instrumentation-fetch**: 0.54.0
- **@opentelemetry/instrumentation-user-interaction**: 0.41.0
- **@opentelemetry/instrumentation-xml-http-request**: 0.54.0

**Purpose**: Distributed tracing for frontend observability

**Integration**: 
- Initialized at application startup
- Automatic instrumentation of fetch, XHR, user interactions
- Trace header propagation to backend
- Export to APM collector

---

## Icons

### React Icons
- **Version**: 5.3.0
- **Purpose**: Icon library
- **Icons Used From**:
  - Bootstrap Icons (Bs*)
  - Material Design Icons (Md*)
- **Examples**:
  - BsCalendarWeek, BsSearch
  - MdAirplanemodeActive, MdFlightTakeoff, MdFlightLand
  - MdOutlineAirlineSeatReclineNormal

---

## Build Tools

### Node.js
- **Version**: LTS (Long Term Support)
- **Purpose**: JavaScript runtime for development and build

### npm
- **Purpose**: Package manager
- **Lock File**: package-lock.json

### Create React App (react-scripts)
- **Version**: 5.0.1
- **Purpose**: Build tooling, development server, test runner
- **Provides**:
  - Webpack bundling (abstracted)
  - Babel transpilation (abstracted)
  - Development server with hot reload
  - Production build optimization
  - Jest test runner
  - ESLint integration

**Scripts**:
- `npm start`: Development server (port 3000)
- `npm build`: Production build
- `npm test`: Run tests
- `npm eject`: Eject from CRA (irreversible)

---

## Development Tools

### HTTP Proxy Middleware
- **Version**: 3.0.3
- **Purpose**: Proxy API requests in development
- **Usage**: setupProxy.js configuration
- **Proxies**:
  - /flightsearchapi → Backend API
  - /tracingapi → OpenTelemetry collector

---

## Testing

### Jest
- **Version**: Included with react-scripts
- **Purpose**: Test framework
- **Configuration**: Via react-scripts

### React Testing Library
- **Version**: Included with react-scripts
- **Purpose**: Component testing utilities
- **Current Usage**: Minimal (only App.test.js)

---

## Performance Monitoring

### Web Vitals
- **Version**: 4.2.4
- **Purpose**: Core Web Vitals tracking
- **Metrics**:
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - TTFB (Time to First Byte)
  - FCP (First Contentful Paint)

---

## Type Checking

### TypeScript
- **Version**: ^4
- **Status**: Listed in devDependencies but NOT actively used
- **Files**: No .ts or .tsx files in project
- **Recommendation**: Either remove or implement

---

## Runtime Environment

### Browser
- **Target Browsers** (from browserslist):
  - **Production**:
    - >0.2% market share
    - Not dead browsers
    - Not Opera Mini
  - **Development**:
    - Last 1 Chrome version
    - Last 1 Firefox version
    - Last 1 Safari version

---

## Production Infrastructure

### NGINX
- **Version**: 1.27
- **Purpose**: Web server and reverse proxy in production
- **Configuration**: default.conf.template with env var substitution
- **Features**:
  - Serve static React build
  - Proxy API requests
  - Environment variable injection at runtime

### Docker
- **Base Images**:
  - Build stage: node:lts-slim
  - Runtime stage: nginx:1.27
- **Build Strategy**: Multi-stage build
  - Stage 1: npm clean-install and build
  - Stage 2: Copy build to NGINX

---

## External Services Integration

### Flight Search Backend
- **Protocol**: HTTP REST
- **Data Format**: JSON
- **Connection**: Proxied through setupProxy.js (dev) or NGINX (prod)
- **Environment Variable**: REACT_APP_FLIGHT_SEARCH

### OpenTelemetry Collector
- **Protocol**: OTLP over HTTP
- **Data Format**: Protobuf or JSON
- **Connection**: Proxied through setupProxy.js (dev) or NGINX (prod)
- **Environment Variable**: REACT_APP_OPENTELEMETRY_ENDPOINT

---

## Code Quality Tools

### ESLint
- **Configuration**: Via react-scripts
- **Extends**:
  - react-app
  - react-app/jest
- **Purpose**: JavaScript linting and code style enforcement

---

## Browser Storage

### localStorage
- **Usage**: Cart and purchase history persistence
- **Keys**:
  - `cart`: Current shopping cart
  - `pastCart`: Purchase history
- **Serialization**: Custom JSON serialization via Functions.js

---

## Version Summary

| Technology | Version | Status | Risk |
|------------|---------|--------|------|
| React | 18.3.1 | Latest stable | Low |
| React Router | 6.27.0 | Latest stable | Low |
| Mantine | 6.0.18 | Stable | Low |
| react-scripts | 5.0.1 | Stable | Low |
| OpenTelemetry | 1.27.0 / 0.54.0 | Stable | Low |
| Node.js | LTS | Current | Low |
| NGINX | 1.27 | Latest stable | Low |
| TypeScript | ^4 | NOT USED | N/A |

**Overall**: Technology stack is modern and well-maintained

---

## Technology Dependencies Graph

```
React 18.3.1
  |
  +-- React Router 6.27.0 (routing)
  |
  +-- Mantine 6.0.18 (UI components)
  |     +-- @mantine/hooks (utilities)
  |     +-- @mantine/dates (date pickers)
  |
  +-- OpenTelemetry 1.27.0 (observability)
  |     +-- Instrumentation libraries
  |     +-- OTLP Exporter
  |
  +-- React Icons 5.3.0 (icons)
  |
  +-- Web Vitals 4.2.4 (performance)

Build Tools
  |
  +-- react-scripts 5.0.1
        +-- Webpack (bundling)
        +-- Babel (transpilation)
        +-- Jest (testing)
        +-- ESLint (linting)

Development
  |
  +-- http-proxy-middleware 3.0.3
  +-- Node.js LTS

Production
  |
  +-- NGINX 1.27
  +-- Docker

External Services
  |
  +-- Flight Search Backend API
  +-- OpenTelemetry Collector
```

---

## Technology Modernization Notes

**Strengths**:
- Modern React 18 with latest features
- Up-to-date dependencies
- Comprehensive observability
- Production-ready containerization

**Considerations**:
- TypeScript listed but unused (cleanup needed)
- Limited test coverage (infrastructure present)
- Could benefit from state management scaling (currently adequate)

**No Critical Dependency Updates Needed**: All versions are current and stable as of analysis date.
