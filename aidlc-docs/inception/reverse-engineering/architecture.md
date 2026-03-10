# System Architecture

## System Overview

FlyFast-WebUI is a React-based Single Page Application (SPA) that serves as the frontend for a flight booking system. The application communicates with a backend flight search API and integrates OpenTelemetry tracing for observability. It uses React Router for client-side navigation, Mantine UI for components, and localStorage for client-side state persistence.

## High-Level Architecture Diagram

```
+-------------------------------------------------------------------+
|                         FlyFast WebUI (React SPA)                 |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |                    Pages (Routes)                           |  |
|  |                                                             |  |
|  |  +---------+  +----------------+  +--------------+          |  |
|  |  |  Home   |  | SearchFlight   |  |   Checkout   |          |  |
|  |  +---------+  +----------------+  +--------------+          |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|  +-------------------------------------------------------------+  |
|  |                    Components                               |  |
|  |                                                             |  |
|  |  +--------+  +-------------+  +------+  +-----------+       |  |
|  |  | Search |  | SearchResults|  | Cart |  | Breakdown |       |  |
|  |  +--------+  +-------------+  +------+  +-----------+       |  |
|  |                                                             |  |
|  |  +------------+  +-----------+  +-----------+               |  |
|  |  | TripCard   |  |  Flight   |  |  Username |               |  |
|  |  +------------+  +-----------+  +-----------+               |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|  +-------------------------------------------------------------+  |
|  |                    Services                                 |  |
|  |                                                             |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  |  | Context  |  |  Flight  |  | Tracing  |  |Functions |     |  |
|  |  | (State)  |  |  (API)   |  | (OTel)   |  | (Utils)  |     |  |
|  |  +----------+  +----------+  +----------+  +----------+     |  |
|  +-------------------------------------------------------------+  |
+-------------------------------------------------------------------+
                              |
                              | HTTP + Trace Headers
                              v
+-------------------------------------------------------------------+
|                       setupProxy.js                               |
|                    (Development Proxy)                            |
|                                                                   |
|  /flightsearchapi --> Backend API (port 8080)                     |
|  /tracingapi --> OpenTelemetry Collector (port 55681)             |
+-------------------------------------------------------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
+-------------------------+     +-----------------------------+
|  Flight Search Backend  |     | OpenTelemetry Collector     |
|  (Port 8080)            |     | (Port 55681)                |
|                         |     |                             |
|  - searchflight         |     | - Receives traces           |
|  - airportypeahead      |     | - Exports to APM platform   |
+-------------------------+     +-----------------------------+
```

## Production Deployment Architecture

```
+--------------------------------------------------------------------+
|                         NGINX Container                            |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |                  Static React Build                          |  |
|  |              (/usr/share/nginx/html)                         |  |
|  |                                                              |  |
|  |  - index.html (with runtime env injection)                   |  |
|  |  - JavaScript bundles                                        |  |
|  |  - CSS assets                                                |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  |                  NGINX Configuration                         |  |
|  |                                                              |  |
|  |  Proxies:                                                    |  |
|  |  - /flightsearchapi -> REACT_APP_FLIGHT_SEARCH              |  |
|  |  - /tracingapi -> REACT_APP_OPENTELEMETRY_ENDPOINT          |  |
|  +--------------------------------------------------------------+  |
+--------------------------------------------------------------------+
                              |
              +---------------+---------------+
              |                               |
              v                               v
+-------------------------+     +-----------------------------+
|  Flight Search Backend  |     | OpenTelemetry Collector     |
|                         |     |                             |
|  Default:               |     | Default:                    |
|  flyfast-flightsearch   |     | apm-collector:55681         |
|  :8080                  |     |                             |
+-------------------------+     +-----------------------------+
```

## Component Descriptions

### Pages (Route Components)

#### Home (`src/pages/Home/Home.js`)
- **Purpose**: Landing page with the main flight search interface
- **Responsibilities**:
  - Render the Search component
  - Provide centered layout for search form
- **Dependencies**: Search component
- **Type**: Page/Route Component

#### SearchFlight (`src/pages/SearchFlight/SearchFlight.js`)
- **Purpose**: Display flight search results based on query parameters
- **Responsibilities**:
  - Parse URL query parameters
  - Fetch flight data from backend
  - Display search results or "no results" message
  - Allow adding flights to cart
- **Dependencies**: SearchResults, Flight service
- **Type**: Page/Route Component

#### Checkout (`src/pages/Checkout/Checkout.js`)
- **Purpose**: Finalize flight booking and complete purchase
- **Responsibilities**:
  - Display order summary and cost breakdown
  - Process purchase transaction
  - Clear cart after successful purchase
- **Dependencies**: Cart context, Breakdown component
- **Type**: Page/Route Component

### Core Components

#### ApplicationContainer (`src/components/ApplicationContainer/ApplicationContainer.js`)
- **Purpose**: Application shell providing common layout and navigation
- **Responsibilities**:
  - Render application header with navigation
  - Provide CartContext to application
  - Wrap all page content
- **Dependencies**: ApplicationHeader, CartProvider
- **Type**: Layout Component

#### Search (`src/components/Search/Search.js`)
- **Purpose**: Flight search form with comprehensive search criteria
- **Responsibilities**:
  - Collect origin, destination, dates, trip type, seat class
  - Support airport type-ahead autocomplete
  - Validate inputs and navigate to search results
  - Reuse data from previous searches
- **Dependencies**: Flight service, AirportInformation utilities, Mantine components
- **Type**: Feature Component

#### SearchResults (`src/components/SearchResults/SearchResults.js`)
- **Purpose**: Container for displaying flight search results
- **Responsibilities**:
  - Manage search results state
  - Delegate to Results or NoResults components
  - Handle loading states
- **Dependencies**: Results, NoResults components
- **Type**: Container Component

#### Cart (`src/components/Cart/Cart.js`)
- **Purpose**: Display and manage shopping cart contents
- **Responsibilities**:
  - Show all flights in cart
  - Calculate total cost
  - Remove individual flights
  - Navigate to checkout
- **Dependencies**: CartContext, FlightDetails
- **Type**: Feature Component

#### TripCard (`src/components/TripCard/TripCard.js`)
- **Purpose**: Display individual flight option in search results
- **Responsibilities**:
  - Show flight details (price, times, airline)
  - Provide "Add to Cart" action
  - Support one-way and round-trip display
- **Dependencies**: CartContext
- **Type**: Presentation Component

### Services

#### Context (`src/services/Context.js`)
- **Purpose**: Global state management for shopping cart
- **Responsibilities**:
  - Manage cart state with localStorage persistence
  - Provide cart operations (add, remove, purchase)
  - Track purchase history
- **Dependencies**: Mantine hooks (useLocalStorage)
- **Type**: State Management Service

#### Flight (`src/services/Flight.js`)
- **Purpose**: API client for backend flight services
- **Responsibilities**:
  - Search flights via backend API
  - Fetch airport type-ahead suggestions
  - Handle API response parsing
- **Dependencies**: Browser fetch API
- **Type**: API Service

#### Tracing (`src/services/Tracing.js`)
- **Purpose**: Initialize OpenTelemetry distributed tracing
- **Responsibilities**:
  - Configure trace exporter to collector
  - Register web instrumentations (fetch, XHR, user interactions, document load)
  - Enable context propagation for distributed tracing
  - Handle production vs development tracing modes
- **Dependencies**: OpenTelemetry SDK packages
- **Type**: Observability Service

#### Functions (`src/services/Functions.js`)
- **Purpose**: Utility functions for common operations
- **Responsibilities**:
  - JSON serialization/deserialization
  - Data transformation helpers
- **Dependencies**: None
- **Type**: Utility Service

#### CustomTracing (`src/services/CustomTracing.js`)
- **Purpose**: Custom trace creation utilities
- **Responsibilities**:
  - Create custom spans for specific operations
  - Add trace attributes
- **Dependencies**: OpenTelemetry API
- **Type**: Observability Utility

## Data Flow

### Flight Search Workflow

```
User Input (Search Form)
         |
         v
+-------------------+
|  Search Component |
|                   |
|  - Validate       |
|  - Format dates   |
|  - Build URL      |
+-------------------+
         |
         | navigate(/searchflight?...)
         v
+------------------------+
|  SearchFlight Page     |
|                        |
|  - Parse query params  |
+------------------------+
         |
         | searchFlight(from, to, dates, seat)
         v
+-------------------+
|  Flight Service   |
|                   |
|  - Build API URI  |
|  - HTTP Request   |
+-------------------+
         |
         | /flightsearchapi/searchflight
         v
+-------------------+
|  setupProxy.js    |
|                   |
|  - Proxy request  |
+-------------------+
         |
         | proxied to backend
         v
+-------------------+
|  Backend API      |
|                   |
|  - Search DB      |
|  - Return results |
+-------------------+
         |
         | JSON response
         v
+------------------------+
|  SearchResults Display |
|                        |
|  - Render TripCards    |
+------------------------+
         |
         | User clicks "Add to Cart"
         v
+-------------------+
|  CartContext      |
|                   |
|  - Add to cart    |
|  - Save to localStorage
+-------------------+
```

### Purchase Workflow

```
User navigates to Checkout
         |
         v
+-------------------+
|  Checkout Page    |
|                   |
|  - Read cart      |
|  - Display total  |
+-------------------+
         |
         | User confirms purchase
         v
+-------------------+
|  CartContext      |
|                   |
|  - purchaseCart() |
+-------------------+
         |
         +---> Move cart to pastCart
         |
         +---> Clear cart
         |
         v
  Purchase Complete
```

## Integration Points

### External APIs

**Flight Search Backend**
- **Endpoint**: Configured via `REACT_APP_FLIGHT_SEARCH` environment variable
- **Default**: `http://flyfast-flightsearch:8080` (Docker) or `http://localhost:8080` (local)
- **APIs**:
  - `/flightsearchapi/searchflight` - Search for available flights
  - `/flightsearchapi/airportypeahead` - Airport autocomplete suggestions
- **Protocol**: HTTP REST with JSON responses
- **Authentication**: None (public API)

**OpenTelemetry Collector**
- **Endpoint**: Configured via `REACT_APP_OPENTELEMETRY_ENDPOINT` environment variable
- **Default**: `http://apm-collector:55681` (Docker) or `http://localhost:55681` (local)
- **Protocol**: OTLP over HTTP
- **Purpose**: Receive distributed traces for APM analysis

### Client-Side Storage

**localStorage**
- **cart**: Current shopping cart contents (array of flight objects)
- **pastCart**: Purchase history (array of flight objects from previous purchases)
- **Format**: JSON serialized via custom Functions utilities

## Infrastructure Components

### Docker Container

**Build Process (Multi-stage)**:
1. **Stage 1**: Node.js build environment
   - Base image: `node:lts-slim`
   - Install dependencies via `npm clean-install`
   - Build React app via `npm run build`

2. **Stage 2**: Production environment
   - Base image: `nginx:1.27`
   - Copy built React app to `/usr/share/nginx/html`
   - Copy NGINX configuration template
   - Runtime environment variable substitution
   - Optional: Alluvio UJI tag injection for extended observability

**Environment Variables**:
- `REACT_APP_FLIGHT_SEARCH`: Backend API URL
- `REACT_APP_OPENTELEMETRY_ENDPOINT`: Trace collector URL
- `ALLUVIO_TAG_PLACEHOLDER`: Placeholder for UJI tag injection (optional)
- `ALLUVIO_UJI_TAG`: Alluvio user journey intelligence tag (optional)

**Exposed Ports**:
- Port 80 (HTTP)

### Development Proxy (setupProxy.js)

**Proxies**:
- `/flightsearchapi` → `process.env.REACT_APP_FLIGHT_SEARCH`
- `/tracingapi` → `process.env.REACT_APP_OPENTELEMETRY_ENDPOINT`

**Purpose**: Avoid CORS issues during local development

## Technology Integration

### React Router Integration
- **Version**: 6.27.0
- **Routing Strategy**: BrowserRouter (HTML5 History API)
- **Lazy Loading**: All page components loaded lazily via React.lazy()
- **Suspense Fallback**: Loading overlay during route transitions

### Mantine UI Integration
- **Version**: 6.0.18
- **Used Components**:
  - Form inputs: Autocomplete, NativeSelect, DatePickerInput
  - Layout: Grid, Group, Paper
  - Feedback: LoadingOverlay
- **Hooks**: useLocalStorage for cart persistence

### OpenTelemetry Integration
- **Trace Export**: OTLP (OpenTelemetry Protocol) over HTTP
- **Instrumentation**:
  - Document load times
  - Fetch API calls (automatic trace header propagation)
  - XMLHttpRequest calls
  - User interactions (clicks, etc.)
- **Context Manager**: ZoneContextManager for async operation tracking
- **Span Processors**:
  - Production: BatchSpanProcessor (efficient batching)
  - Development: SimpleSpanProcessor with console export

### Build Tool
- **Tool**: react-scripts (Create React App)
- **Version**: 5.0.1
- **Scripts**:
  - `npm start`: Development server
  - `npm build`: Production build
  - `npm test`: Run tests
  - `npm eject`: Eject from CRA (not recommended)
