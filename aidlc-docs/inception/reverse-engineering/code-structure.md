# Code Structure

## Build System

- **Type**: npm (Node Package Manager)
- **Configuration File**: `package.json`
- **Lock File**: `package-lock.json`
- **Build Tool**: react-scripts (Create React App)
- **Node Version**: Requires Node.js LTS
- **Package Manager Commands**:
  - Install: `npm install --legacy-peer-deps` (legacy) or `npm clean-install` (immutable)
  - Start dev server: `npm start`
  - Build production: `npm build`
  - Run tests: `npm test`

## Project Structure

```
FlyFast-WebUI/
|
+-- public/                      # Static assets
|   +-- index.html               # HTML template
|   +-- manifest.json            # PWA manifest
|   +-- robots.txt               # SEO robots file
|
+-- src/                         # Source code
|   +-- index.js                 # Application entry point
|   +-- index.css                # Global styles
|   +-- App.js                   # Root component with routing
|   +-- App.css                  # Root component styles
|   +-- App.test.js              # Root component tests
|   +-- setupTests.js            # Test configuration
|   +-- setupProxy.js            # Development proxy configuration
|   +-- reportWebVitals.js       # Performance monitoring
|   |
|   +-- pages/                   # Page-level route components
|   |   +-- Home/
|   |   |   +-- Home.js
|   |   +-- SearchFlight/
|   |   |   +-- SearchFlight.js
|   |   +-- Checkout/
|   |       +-- Checkout.js
|   |
|   +-- components/              # Reusable components
|   |   +-- ApplicationContainer/
|   |   |   +-- ApplicationContainer.js
|   |   |   +-- ApplicationHeader.js
|   |   +-- Authentication/
|   |   |   +-- Username.js
|   |   +-- Search/
|   |   |   +-- Search.js
|   |   |   +-- AirportInformation.js
|   |   |   +-- AirportsData.json
|   |   |   +-- SeatData.json
|   |   |   +-- TripData.json
|   |   +-- SearchResults/
|   |   |   +-- SearchResults.js
|   |   |   +-- Results.js
|   |   |   +-- NoResults.js
|   |   +-- TripCard/
|   |   |   +-- TripCard.js
|   |   |   +-- FlightDetails.js
|   |   +-- Flight/
|   |   |   +-- Flight.js
|   |   +-- Cart/
|   |   |   +-- Cart.js
|   |   |   +-- EmptyCart.js
|   |   |   +-- FlightDetails.js
|   |   +-- Breakdown/
|   |       +-- Confirmation.js
|   |       +-- Cost.js
|   |
|   +-- services/                # Services and utilities
|       +-- Context.js           # Cart state management
|       +-- Flight.js            # Flight API client
|       +-- Tracing.js           # OpenTelemetry setup
|       +-- CustomTracing.js     # Custom trace utilities
|       +-- Functions.js         # Utility functions
|
+-- aidlc-docs/                  # AI-DLC documentation
|
+-- Dockerfile                   # Container build definition
+-- default.conf.template        # NGINX configuration template
+-- .env.example                 # Environment variable example
+-- .dockerignore                # Docker ignore rules
+-- .gitignore                   # Git ignore rules
+-- package.json                 # npm package configuration
+-- package-lock.json            # npm dependency lock
+-- README.md                    # Project documentation
+-- LICENSE                      # License file
```

## Key Files Inventory

### Application Entry Points

- **`src/index.js`** - Application bootstrap, initializes React, tracing, and renders root component
- **`src/App.js`** - Root component defining application routes and lazy-loaded pages
- **`public/index.html`** - HTML template with root div and optional tag injection placeholder

### Pages (Routes)

- **`src/pages/Home/Home.js`** - Landing page with centered search form
- **`src/pages/SearchFlight/SearchFlight.js`** - Flight search results page with query parameter handling
- **`src/pages/Checkout/Checkout.js`** - Purchase confirmation and order summary page

### Layout Components

- **`src/components/ApplicationContainer/ApplicationContainer.js`** - Application shell providing CartContext
- **`src/components/ApplicationContainer/ApplicationHeader.js`** - Top navigation bar with username, cart, navigation links

### Feature Components

- **`src/components/Search/Search.js`** - Comprehensive flight search form with autocomplete
- **`src/components/SearchResults/SearchResults.js`** - Container for search results display
- **`src/components/SearchResults/Results.js`** - Grid of TripCard components for available flights
- **`src/components/SearchResults/NoResults.js`** - Message displayed when no flights match criteria
- **`src/components/TripCard/TripCard.js`** - Individual flight option card with add-to-cart action
- **`src/components/TripCard/FlightDetails.js`** - Detailed flight information display helper
- **`src/components/Flight/Flight.js`** - Flight detail component (specific implementation)
- **`src/components/Cart/Cart.js`** - Shopping cart display with item management
- **`src/components/Cart/EmptyCart.js`** - Message shown when cart is empty
- **`src/components/Cart/FlightDetails.js`** - Flight details display within cart
- **`src/components/Breakdown/Confirmation.js`** - Purchase confirmation message
- **`src/components/Breakdown/Cost.js`** - Cost breakdown and total calculation display
- **`src/components/Authentication/Username.js`** - User identification display component

### Services and Utilities

- **`src/services/Context.js`** - CartContext provider with localStorage-backed state management
- **`src/services/Flight.js`** - API client for searchFlight and airportTypeAhead endpoints
- **`src/services/Tracing.js`** - OpenTelemetry initialization and instrumentation configuration
- **`src/services/CustomTracing.js`** - Custom trace span creation utilities
- **`src/services/Functions.js`** - JSON serialization and utility functions

### Static Data Files

- **`src/components/Search/AirportsData.json`** - Airport reference data for offline autocomplete
- **`src/components/Search/SeatData.json`** - Seat class options (Economy, Premium Economy, Business, First)
- **`src/components/Search/TripData.json`** - Trip type options (One Way, Round Trip)
- **`src/components/Search/AirportInformation.js`** - Airport data filtering and formatting utilities

### Configuration Files

- **`src/setupProxy.js`** - Development proxy configuration for API and tracing endpoints
- **`src/setupTests.js`** - Jest test environment setup
- **`src/reportWebVitals.js`** - Web Vitals performance monitoring configuration
- **`package.json`** - npm dependencies, scripts, and project metadata
- **`.env.example`** - Environment variable template
- **`Dockerfile`** - Multi-stage Docker build with Node.js build and NGINX runtime
- **`default.conf.template`** - NGINX configuration template with environment variable substitution

### Testing Files

- **`src/App.test.js`** - Basic smoke test for App component

## Design Patterns

### Context API Pattern
- **Location**: `src/services/Context.js`
- **Purpose**: Share cart state across component tree without prop drilling
- **Implementation**:
  - CartContext created via createContext()
  - CartProvider component wraps application
  - Consumer components use useContext(CartContext)
  - State persisted to localStorage automatically

### Container/Presentation Pattern
- **Location**: Throughout components directory
- **Purpose**: Separate data fetching/logic from UI rendering
- **Implementation**:
  - Container components: SearchResults, ApplicationContainer
  - Presentation components: TripCard, Flight, EmptyCart
  - Containers handle state and pass props to presenters

### Lazy Loading Pattern
- **Location**: `src/App.js`
- **Purpose**: Code splitting for faster initial load
- **Implementation**:
  - React.lazy() for dynamic imports of page components
  - Suspense boundary with LoadingOverlay fallback
  - Separate bundles for each route

### Service Layer Pattern
- **Location**: `src/services/`
- **Purpose**: Centralize business logic and external integrations
- **Implementation**:
  - Flight.js: API communication layer
  - Context.js: State management layer
  - Tracing.js: Observability layer
  - Functions.js: Utility layer

### Proxy Pattern
- **Location**: `src/setupProxy.js`
- **Purpose**: Route API requests through development server to avoid CORS
- **Implementation**:
  - http-proxy-middleware intercepts paths
  - Rewrites and forwards to backend services
  - Transparent to client code

### Higher-Order Component Pattern (via Hooks)
- **Location**: Various components
- **Purpose**: Reuse stateful logic across components
- **Implementation**:
  - useLocalStorage hook from Mantine
  - useNavigate hook from React Router
  - Custom hooks could be extracted from Search component logic

## Component Architecture

### Component Hierarchy

```
App (Router)
  |
  +-- ApplicationContainer (CartProvider)
        |
        +-- ApplicationHeader
        |     +-- Username
        |     +-- Cart indicator
        |     +-- Navigation links
        |
        +-- Suspense (LoadingOverlay fallback)
              |
              +-- Routes
                    |
                    +-- Home
                    |     +-- Search
                    |           +-- Airport Autocomplete
                    |           +-- Date Pickers
                    |           +-- Seat/Trip Selectors
                    |
                    +-- SearchFlight
                    |     +-- SearchResults
                    |           +-- Results
                    |           |     +-- TripCard (multiple)
                    |           |           +-- FlightDetails
                    |           +-- NoResults
                    |
                    +-- Checkout
                          +-- Cart
                          |     +-- FlightDetails (multiple)
                          |     +-- EmptyCart (conditional)
                          +-- Breakdown
                                +-- Cost
                                +-- Confirmation
```

## Critical Dependencies

### React Core
- **react**: `^18.3.1`
- **react-dom**: `^18.3.1`
- **Usage**: Core framework for building UI
- **Purpose**: Component model, hooks, virtual DOM
- **Critical**: Application foundation

### React Router
- **react-router-dom**: `^6.27.0`
- **Usage**: All routing and navigation throughout app
- **Purpose**: Client-side routing, URL parameter parsing, programmatic navigation
- **Critical**: Navigation infrastructure

### Mantine UI
- **@mantine/core**: `^6.0.18`
- **@mantine/dates**: `^6.0.18`
- **@mantine/hooks**: `^6.0.18`
- **Usage**: UI components and hooks throughout application
- **Purpose**: Complete component library, form inputs, layouts, hooks
- **Critical**: Primary UI framework

### OpenTelemetry (Web)
- **@opentelemetry/api**: `^1.9.0`
- **@opentelemetry/sdk-trace-web**: `^1.27.0`
- **@opentelemetry/exporter-trace-otlp-http**: `^0.54.0`
- **@opentelemetry/instrumentation-***: Various versions
- **Usage**: Tracing initialization and instrumentation
- **Purpose**: Distributed tracing for observability
- **Critical**: Monitoring and performance analysis

### Build Tooling
- **react-scripts**: `^5.0.1`
- **Usage**: Build, development server, test runner
- **Purpose**: Create React App tooling
- **Critical**: Development and build process

### Proxy Middleware
- **http-proxy-middleware**: `^3.0.3`
- **Usage**: Development proxy in setupProxy.js
- **Purpose**: Proxy API requests to backend during development
- **Critical**: Local development (not used in production)

### Icons
- **react-icons**: `^5.3.0`
- **Usage**: Icons throughout UI (BsCalendarWeek, MdAirplanemodeActive, etc.)
- **Purpose**: Icon library
- **Optional**: Could be replaced with alternatives

### Performance Monitoring
- **web-vitals**: `^4.2.4`
- **Usage**: reportWebVitals.js
- **Purpose**: Track Core Web Vitals metrics
- **Optional**: Performance monitoring

## Code Quality Indicators

### Linting
- **ESLint** configured via package.json
- **Config**: Extends `react-app` and `react-app/jest`
- **Status**: Configured

### Code Style
- **Consistency**: Generally consistent React patterns
- **Component Style**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for variables/functions

### Test Coverage
- **Framework**: React Testing Library (via react-scripts)
- **Status**: Minimal (only App.test.js exists)
- **Coverage**: Very limited, only basic smoke test

### Documentation
- **README.md**: Good, includes setup and usage instructions
- **Inline Comments**: Minimal, code is mostly self-documenting
- **Component Documentation**: None (no PropTypes or TypeScript)
- **Status**: Fair

## Technical Considerations

### Type Safety
- **TypeScript**: Listed in devDependencies (`^4`) but NOT actively used
- **PropTypes**: Not used
- **Status**: No runtime or compile-time type checking
- **Risk**: Medium (could lead to runtime errors)

### State Management
- **Approach**: React Context API with localStorage persistence
- **Scope**: Only cart state is globally managed
- **Scalability**: Adequate for current scope

### Error Handling
- **API Errors**: Caught in components with .catch()
- **Tracing Errors**: Caught and logged in Tracing.js
- **User Feedback**: Limited error messaging
- **Status**: Basic error handling present

### Performance Optimizations
- **Code Splitting**: Lazy loaded routes
- **Memoization**: Not extensively used
- **Bundle Size**: Likely reasonable but not analyzed
- **Status**: Basic optimizations in place
