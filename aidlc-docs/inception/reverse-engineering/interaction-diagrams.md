# Interaction Diagrams

## Overview

This document depicts how business transactions are implemented across components, showing the interaction flows between UI components, services, and external systems.

---

## Diagram 1: Flight Search Business Transaction

### Description
User searches for available flights by entering origin, destination, dates, and seat preferences.

### Flow Diagram

```
+----------+     +--------+     +-------------+     +------------------+     +---------+
|  User    |     | Search |     | Flight      |     | setupProxy /     |     | Backend |
|          |     | Component   | Service     |     | NGINX            |     | API     |
+----------+     +--------+     +-------------+     +------------------+     +---------+
     |               |                |                      |                     |
     | 1. Enter      |                |                      |                     |
     |    search     |                |                      |                     |
     |    criteria   |                |                      |                     |
     +-------------->|                |                      |                     |
     |               |                |                      |                     |
     |               | 2. Validate    |                      |                     |
     |               |    inputs      |                      |                     |
     |               |                |                      |                     |
     |               | 3. Format      |                      |                     |
     |               |    dates       |                      |                     |
     |               |                |                      |                     |
     |               | 4. Build URL   |                      |                     |
     |               |    params      |                      |                     |
     |               |                |                      |                     |
     |               | 5. Navigate to |                      |                     |
     |               |    /searchflight?params              |                     |
     |               +----------------|----------------------+                     |
     |               |                |                      |                     |
     |    [Router navigates to SearchFlight page]           |                     |
     |               |                |                      |                     |
     |               | 6. Parse URL   |                      |                     |
     |               |    params      |                      |                     |
     |               |                |                      |                     |
     |               | 7. searchFlight(params)              |                     |
     |               +--------------->|                      |                     |
     |               |                |                      |                     |
     |               |                | 8. Build API URI     |                     |
     |               |                |    /flightsearchapi/searchflight           |
     |               |                |                      |                     |
     |               |                | 9. fetch(URI)        |                     |
     |               |                +--------------------->|                     |
     |               |                |                      |                     |
     |               |                |                      | 10. Proxy request  |
     |               |                |                      +-------------------->|
     |               |                |                      |                     |
     |               |                |                      |                     | 11. Query DB
     |               |                |                      |                     |
     |               |                |                      | 12. JSON response  |
     |               |                |                      |<--------------------+
     |               |                |                      |                     |
     |               |                | 13. JSON response    |                     |
     |               |                |<---------------------+                     |
     |               |                |                      |                     |
     |               | 14. Flight     |                      |                     |
     |               |     data array |                      |                     |
     |               |<---------------+                      |                     |
     |               |                |                      |                     |
     |               | 15. Render     |                      |                     |
     |               |     Results    |                      |                     |
     |               |     (TripCards)|                      |                     |
     |               |                |                      |                     |
     | 16. View      |                |                      |                     |
     |     results   |                |                      |                     |
     |<--------------+                |                      |                     |
     |               |                |                      |                     |
```

### Components Involved
- **Search Component**: Collects user input and validates
- **Flight Service**: Makes API call to backend
- **SearchFlight Page**: Orchestrates search execution
- **Results Component**: Displays flight options as TripCards
- **setupProxy/NGINX**: Routes API calls to backend

### Trace Propagation
OpenTelemetry automatically instruments the fetch() call and propagates trace headers to the backend, enabling distributed tracing across frontend and backend.

---

## Diagram 2: Add Flight to Cart Business Transaction

### Description
User selects a flight from search results and adds it to their shopping cart.

### Flow Diagram

```
+----------+     +----------+     +-------------+     +---------------+
|  User    |     | TripCard |     | CartContext |     | localStorage  |
|          |     | Component     | Provider    |     |               |
+----------+     +----------+     +-------------+     +---------------+
     |               |                   |                   |
     | 1. Click      |                   |                   |
     |   "Add to     |                   |                   |
     |    Cart"      |                   |                   |
     +-------------->|                   |                   |
     |               |                   |                   |
     |               | 2. addToCart(     |                   |
     |               |      [flight])    |                   |
     |               +------------------>|                   |
     |               |                   |                   |
     |               |                   | 3. Merge flight   |
     |               |                   |    with existing  |
     |               |                   |    cart array     |
     |               |                   |                   |
     |               |                   | 4. setCart(       |
     |               |                   |      newCart)     |
     |               |                   |                   |
     |               |                   | 5. Serialize      |
     |               |                   |    to JSON        |
     |               |                   +------------------>|
     |               |                   |                   |
     |               |                   |                   | 6. Save to
     |               |                   |                   |    localStorage
     |               |                   |                   |    key: 'cart'
     |               |                   |                   |
     |               |                   | 7. Success        |
     |               |                   |<------------------+
     |               |                   |                   |
     |               |                   | 8. Trigger        |
     |               |                   |    re-render      |
     |               |                   |    (Context       |
     |               |                   |     consumers)    |
     |               |                   |                   |
     |               | 9. Return         |                   |
     |               |<------------------+                   |
     |               |                   |                   |
     |               | 10. Update UI     |                   |
     |               |     (visual       |                   |
     |               |      feedback)    |                   |
     |               |                   |                   |
     | 11. Confirm   |                   |                   |
     |     added     |                   |                   |
     |<--------------+                   |                   |
     |               |                   |                   |
     |               |    [Cart count in header updates]     |
     |               |                   |                   |
```

### Components Involved
- **TripCard Component**: Displays flight and provides "Add to Cart" button
- **CartContext**: Manages cart state globally
- **useLocalStorage Hook**: Automatically persists cart to browser storage
- **ApplicationHeader**: Displays cart count (updates via Context)

### Persistence
Cart data persists across browser sessions via localStorage, enabling users to return later and complete their purchase.

---

## Diagram 3: Purchase Completion Business Transaction

### Description
User finalizes their flight bookings and completes the purchase.

### Flow Diagram

```
+----------+     +----------+     +-------------+     +---------------+
|  User    |     | Checkout |     | CartContext |     | localStorage  |
|          |     | Page     |     | Provider    |     |               |
+----------+     +----------+     +-------------+     +---------------+
     |               |                   |                   |
     | 1. Navigate   |                   |                   |
     |    to /checkout                   |                   |
     +-------------->|                   |                   |
     |               |                   |                   |
     |               | 2. Read cart      |                   |
     |               +------------------>|                   |
     |               |                   |                   |
     |               |                   | 3. Get cart       |
     |               |                   |    from state     |
     |               |                   |                   |
     |               | 4. Cart data      |                   |
     |               |<------------------+                   |
     |               |                   |                   |
     |               | 5. Display        |                   |
     |               |    order summary  |                   |
     |               |    (Cart +        |                   |
     |               |     Breakdown)    |                   |
     |               |                   |                   |
     | 6. View       |                   |                   |
     |    order      |                   |                   |
     |    details    |                   |                   |
     |<--------------+                   |                   |
     |               |                   |                   |
     | 7. Confirm    |                   |                   |
     |    purchase   |                   |                   |
     +-------------->|                   |                   |
     |               |                   |                   |
     |               | 8. purchaseCart() |                   |
     |               +------------------>|                   |
     |               |                   |                   |
     |               |                   | 9. Move cart      |
     |               |                   |    to pastCart    |
     |               |                   |    (history)      |
     |               |                   |                   |
     |               |                   | 10. Clear cart    |
     |               |                   |     array         |
     |               |                   |                   |
     |               |                   | 11. Save both     |
     |               |                   |     to storage    |
     |               |                   +------------------>|
     |               |                   |                   |
     |               |                   |                   | 12. Update
     |               |                   |                   |     'cart' key
     |               |                   |                   |     (empty)
     |               |                   |                   |
     |               |                   |                   | 13. Update
     |               |                   |                   |     'pastCart'
     |               |                   |                   |     key
     |               |                   |                   |
     |               |                   | 14. Success       |
     |               |                   |<------------------+
     |               |                   |                   |
     |               |                   | 15. Trigger       |
     |               |                   |     re-render     |
     |               |                   |                   |
     |               | 16. Return        |                   |
     |               |<------------------+                   |
     |               |                   |                   |
     |               | 17. Display       |                   |
     |               |     confirmation  |                   |
     |               |                   |                   |
     | 18. View      |                   |                   |
     |     confirmation                  |                   |
     |<--------------+                   |                   |
     |               |                   |                   |
```

### Components Involved
- **Checkout Page**: Orchestrates purchase flow
- **Cart Component**: Displays items to be purchased
- **Breakdown Component**: Shows cost breakdown and confirmation
- **CartContext**: Manages purchase transaction
- **localStorage**: Persists purchase history

### Business Rules
- Cart is cleared after successful purchase
- Purchase history is maintained in pastCart
- Both operations are atomic (happen together)

---

## Diagram 4: Airport Type-Ahead Business Transaction

### Description
User types in airport search field and receives real-time autocomplete suggestions.

### Flow Diagram

```
+----------+     +--------+     +-------------+     +------------------+     +---------+
|  User    |     | Search |     | Flight      |     | setupProxy /     |     | Backend |
|          |     | Component   | Service     |     | NGINX            |     | API     |
+----------+     +--------+     +-------------+     +------------------+     +---------+
     |               |                |                      |                     |
     | 1. Type in    |                |                      |                     |
     |    airport    |                |                      |                     |
     |    field      |                |                      |                     |
     +-------------->|                |                      |                     |
     |               |                |                      |                     |
     |               | 2. On change   |                      |                     |
     |               |    event       |                      |                     |
     |               |    (debounced) |                      |                     |
     |               |                |                      |                     |
     |               | 3. Check if    |                      |                     |
     |               |    backend     |                      |                     |
     |               |    enabled     |                      |                     |
     |               |                |                      |                     |
     |               | 4. airportTypeAhead(text, limit=5)   |                     |
     |               +--------------->|                      |                     |
     |               |                |                      |                     |
     |               |                | 5. Early return      |                     |
     |               |                |    if text empty     |                     |
     |               |                |                      |                     |
     |               |                | 6. Build API URI     |                     |
     |               |                |    /flightsearchapi/airportypeahead       |
     |               |                |                      |                     |
     |               |                | 7. fetch(URI)        |                     |
     |               |                +--------------------->|                     |
     |               |                |                      |                     |
     |               |                |                      | 8. Proxy request   |
     |               |                |                      +-------------------->|
     |               |                |                      |                     |
     |               |                |                      |                     | 9. Search
     |               |                |                      |                     |    airports
     |               |                |                      |                     |
     |               |                |                      | 10. JSON response  |
     |               |                |                      |     (airport array)|
     |               |                |                      |<--------------------+
     |               |                |                      |                     |
     |               |                | 11. JSON response    |                     |
     |               |                |<---------------------+                     |
     |               |                |                      |                     |
     |               | 12. Airport    |                      |                     |
     |               |     data array |                      |                     |
     |               |<---------------+                      |                     |
     |               |                |                      |                     |
     |               | 13. Update     |                      |                     |
     |               |     autocomplete                      |                     |
     |               |     dropdown   |                      |                     |
     |               |                |                      |                     |
     | 14. View      |                |                      |                     |
     |     suggestions                |                      |                     |
     |<--------------+                |                      |                     |
     |               |                |                      |                     |
     | 15. Select    |                |                      |                     |
     |     airport   |                |                      |                     |
     +-------------->|                |                      |                     |
     |               |                |                      |                     |
     |               | 16. Update     |                      |                     |
     |               |     form state |                      |                     |
     |               |                |                      |                     |
```

### Components Involved
- **Search Component**: Manages autocomplete state
- **Autocomplete Component** (Mantine): Displays dropdown
- **Flight Service**: Calls backend API
- **Backend API**: Searches airport database

### Performance Optimization
- Requests are debouncing via React useEffect dependencies
- Limit parameter (default 5) reduces response size
- Empty text check avoids unnecessary API calls

---

## Diagram 5: OpenTelemetry Tracing Flow

### Description
How distributed tracing works across the application, automatically instrumenting user interactions and API calls.

### Flow Diagram

```
+----------+     +----------------+     +---------------------+     +---------+
|  User    |     | React App      |     | OpenTelemetry SDK   |     | Collector
|          |     |                |     |                     |     |         |
+----------+     +----------------+     +---------------------+     +---------+
     |                  |                        |                       |
     | 1. Application   |                        |                       |
     |    loads         |                        |                       |
     +----------------->|                        |                       |
     |                  |                        |                       |
     |                  | 2. Initialize          |                       |
     |                  |    Tracing()           |                       |
     |                  +----------------------->|                       |
     |                  |                        |                       |
     |                  |                        | 3. Register           |
     |                  |                        |    instrumentations   |
     |                  |                        |    - Document Load    |
     |                  |                        |    - Fetch            |
     |                  |                        |    - XHR              |
     |                  |                        |    - User Interaction |
     |                  |                        |                       |
     |                  |                        | 4. Create tracer      |
     |                  |                        |    "FlyFast-WebUI"    |
     |                  |                        |                       |
     |                  | 5. Tracer ready        |                       |
     |                  |<-----------------------+                       |
     |                  |                        |                       |
     | 6. User          |                        |                       |
     |    interaction   |                        |                       |
     |    (click search)|                        |                       |
     +----------------->|                        |                       |
     |                  |                        |                       |
     |                  | 7. Auto-instrument     |                       |
     |                  |    creates span        |                       |
     |                  |    "user.interaction"  |                       |
     |                  +----------------------->|                       |
     |                  |                        |                       |
     |                  | 8. Make API call       |                       |
     |                  |    fetch(...)          |                       |
     |                  +----------------------->|                       |
     |                  |                        |                       |
     |                  |                        | 9. FetchInstrumentation
     |                  |                        |    creates span       |
     |                  |                        |    "HTTP GET"         |
     |                  |                        |                       |
     |                  |                        | 10. Inject trace      |
     |                  |                        |     headers           |
     |                  |                        |     (traceparent)     |
     |                  |                        |                       |
     |                  |                        | 11. Execute fetch     |
     |                  |<-----------------------+    with headers       |
     |                  |                        |                       |
     |                  |   [Request sent to backend with trace headers]|
     |                  |                        |                       |
     |                  | 12. Response received  |                       |
     |                  +----------------------->|                       |
     |                  |                        |                       |
     |                  |                        | 13. Complete span     |
     |                  |                        |     with status       |
     |                  |                        |                       |
     |                  |                        | 14. Batch spans       |
     |                  |                        |     (production) or   |
     |                  |                        |     immediate         |
     |                  |                        |     (development)     |
     |                  |                        |                       |
     |                  |                        | 15. Export via OTLP   |
     |                  |                        |     /tracingapi/v1/traces
     |                  |                        +---------------------->|
     |                  |                        |                       |
     |                  |                        |                       | 16. Store
     |                  |                        |                       |     traces
     |                  |                        |                       |
     |                  |                        | 17. Export success    |
     |                  |                        |<----------------------+
     |                  |                        |                       |
```

### Components Involved
- **Tracing.js**: Initializes OpenTelemetry SDK
- **Instrumentation Libraries**: Auto-instrument browser APIs
- **WebTracerProvider**: Creates and manages traces
- **OTLPTraceExporter**: Exports traces to collector
- **Collector**: Receives and stores traces for APM platform

### Key Features
- **Automatic**: No manual instrumentation needed for fetch/XHR
- **Distributed**: Trace headers propagated to backend
- **Context Aware**: ZoneContextManager handles async operations
- **Production Optimized**: BatchSpanProcessor reduces overhead

---

## Cross-Component Interaction Summary

### State Management Flow

```
           CartContext (Global State)
                    |
        +-----------+-----------+
        |           |           |
   TripCard     Cart Page   ApplicationHeader
   (Add to)     (Display)   (Cart count)
```

### Navigation Flow

```
Home Page
    |
    +-- Search Component (form submit)
    |
    v
SearchFlight Page
    |
    +-- Results/TripCards (add to cart)
    |
    v
Checkout Page
    |
    +-- Cart (purchase)
    |
    v
Confirmation
```

### Service Integration Flow

```
UI Components
    |
    +-- Flight Service (API calls)
    |       |
    |       +-- setupProxy/NGINX (routing)
    |               |
    |               +-- Backend API
    |
    +-- CartContext (state)
    |       |
    |       +-- localStorage (persistence)
    |
    +-- Tracing Service (observability)
            |
            +-- OpenTelemetry Collector
```

---

## Performance Considerations in Transactions

### Flight Search
- **Lazy Loading**: SearchFlight page only loaded when route accessed
- **Trace Overhead**: Minimal (<5ms) from instrumentation
- **Network**: Single API call, JSON response

### Cart Operations
- **localStorage**: Synchronous but fast (<1ms typical)
- **Context Updates**: Efficient via React Context API
- **Re-renders**: Limited to Context consumers only

### Tracing
- **Production**: Batched exports reduce overhead
- **Development**: Console logging for debugging
- **Async**: Non-blocking, doesn't impact user experience

---

## Notes

1. All fetch() calls are automatically instrumented by OpenTelemetry
2. Trace context propagates from frontend to backend automatically
3. Cart persistence happens synchronously but is fast due to localStorage
4. Router-based navigation enables lazy loading and code splitting
5. Context API provides efficient state updates without prop drilling
