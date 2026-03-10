# API Documentation

## External REST APIs (Backend Integration)

### 1. Search Flight API

**Endpoint**: `/flightsearchapi/searchflight`

**Method**: GET

**Purpose**: Search for available flights based on origin, destination, dates, and seat class

**Base URL**: 
- Development: Proxied via setupProxy.js to `process.env.REACT_APP_FLIGHT_SEARCH`
- Production: Proxied via NGINX to configured backend URL

**Request Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| from | string | Yes | Origin airport code | JFK |
| to | string | Yes | Destination airport code | LAX |
| departure | string | Yes | Departure date | 3-15-2026 |
| return | string | No | Return date (omit for one-way) | 3-22-2026 |
| seat | string | Yes | Seat class | Economy, Premium Economy, Business, First |

**Example Request**:
```
GET /flightsearchapi/searchflight?from=JFK&to=LAX&departure=3-15-2026&return=3-22-2026&seat=Economy
```

**Response Format**: JSON array of flight options

**Expected Response Structure** (inferred from usage):
```json
[
  {
    "flightId": "string",
    "origin": "string",
    "destination": "string",
    "departureTime": "string",
    "arrivalTime": "string",
    "price": "number",
    "airline": "string",
    "duration": "string",
    "seatClass": "string"
  }
]
```

**Error Handling**:
- Errors caught in component with `.catch(error => console.error(error))`
- Empty results handled by displaying NoResults component

---

### 2. Airport Type-Ahead API

**Endpoint**: `/flightsearchapi/airportypeahead`

**Method**: GET

**Purpose**: Provide autocomplete suggestions for airport names/codes as user types

**Base URL**: 
- Development: Proxied via setupProxy.js to `process.env.REACT_APP_FLIGHT_SEARCH`
- Production: Proxied via NGINX to configured backend URL

**Request Parameters**:
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| searchtxt | string | Yes | Search text entered by user | New |
| limit | number | No | Maximum number of results | 5 |

**Example Request**:
```
GET /flightsearchapi/airportypeahead?searchtxt=New&limit=5
```

**Response Format**: JSON array of airport objects

**Expected Response Structure** (inferred from usage):
```json
[
  {
    "code": "string",
    "name": "string",
    "city": "string",
    "country": "string"
  }
]
```

**Usage Context**:
- Called with empty text check to avoid unnecessary requests
- Results used to populate Autocomplete dropdown
- Default limit set to 5 in Search component

**Error Handling**:
- Errors caught and logged to console
- Failed requests result in empty autocomplete options

---

## OpenTelemetry Tracing API

### Trace Export Endpoint

**Endpoint**: `/tracingapi/v1/traces`

**Method**: POST

**Purpose**: Export OpenTelemetry trace data to collector for APM analysis

**Base URL**: 
- Development: Proxied via setupProxy.js to `process.env.REACT_APP_OPENTELEMETRY_ENDPOINT`
- Production: Proxied via NGINX to configured collector URL

**Protocol**: OTLP (OpenTelemetry Protocol) over HTTP

**Request Format**: Protobuf or JSON (configured by exporter)

**Trace Context Propagation**:
- Automatic trace header injection via FetchInstrumentation
- Headers propagated to backend API calls
- Supports W3C Trace Context standard (traceparent header)

**Instrumented Operations**:
- Document load
- Fetch API calls
- XMLHttpRequest calls
- User interactions (clicks, form submissions)

**Configuration**:
- **Service Name**: "FlyFast-WebUI"
- **Span Processor**: 
  - Production: BatchSpanProcessor (efficient batching)
  - Development: SimpleSpanProcessor (immediate export + console logging)
- **Context Manager**: ZoneContextManager (async operation support)

**Error Handling**:
- Tracing initialization errors caught and logged
- Application continues if tracing fails (graceful degradation)

---

## Internal APIs (JavaScript Modules)

### Flight Service API

**Module**: `src/services/Flight.js`

#### searchFlight(from, to, departureDate, returnDate, seatType)

**Purpose**: Search for flights

**Parameters**:
- `from` (string): Origin airport code
- `to` (string): Destination airport code
- `departureDate` (string): Departure date (format: M-D-YYYY)
- `returnDate` (string|null): Return date or null for one-way
- `seatType` (string): Seat class

**Returns**: Promise<Array>

**Example**:
```javascript
import { searchFlight } from './services/Flight';

const results = await searchFlight('JFK', 'LAX', '3-15-2026', '3-22-2026', 'Economy');
```

#### airportTypeAhead(text, limit)

**Purpose**: Get airport autocomplete suggestions

**Parameters**:
- `text` (string): Search text
- `limit` (number|undefined): Maximum results

**Returns**: Promise<Array>

**Early Return**: Returns empty array if text is falsy

**Example**:
```javascript
import { airportTypeAhead } from './services/Flight';

const airports = await airportTypeAhead('New', 5);
```

---

### Cart Context API

**Module**: `src/services/Context.js`

**Provider**: CartProvider

**Context**: CartContext

#### State Properties

**cart** (Array)
- Current shopping cart contents
- Persisted to localStorage under key 'cart'
- Default: []

**pastCart** (Array)
- Purchase history
- Persisted to localStorage under key 'pastCart'
- Default: []

#### Methods

**addToCart(flight)**
- **Purpose**: Add flight(s) to cart
- **Parameters**: 
  - `flight` (Array): Flight objects to add
- **Returns**: void
- **Side Effect**: Updates cart and localStorage

**removeFromCart(index)**
- **Purpose**: Remove a flight from cart by index
- **Parameters**: 
  - `index` (number): Index of flight to remove
- **Returns**: void
- **Side Effect**: Updates cart and localStorage

**purchaseCart()**
- **Purpose**: Complete purchase, move cart to history
- **Parameters**: None
- **Returns**: void
- **Side Effects**: 
  - Moves cart to pastCart
  - Clears cart
  - Updates localStorage

**Example Usage**:
```javascript
import { useContext } from 'react';
import { CartContext } from './services/Context';

const MyComponent = () => {
  const { cart, addToCart, removeFromCart, purchaseCart } = useContext(CartContext);
  
  // Add flight
  addToCart([flightObject]);
  
  // Remove flight
  removeFromCart(0);
  
  // Purchase
  purchaseCart();
};
```

---

### Tracing Service API

**Module**: `src/services/Tracing.js`

#### Tracing()

**Purpose**: Initialize OpenTelemetry tracing

**Parameters**: None

**Returns**: 
- Tracer object on success
- null on failure

**Side Effects**:
- Registers OpenTelemetry instrumentation
- Configures trace exporter
- Sets up context manager

**Configuration**:
- Service name: "FlyFast-WebUI"
- Trace endpoint: "/tracingapi/v1/traces"

**Example**:
```javascript
import Tracing from './services/Tracing';

// Call once at application startup
const tracer = Tracing();
```

---

### Utility Functions API

**Module**: `src/services/Functions.js`

#### jsonSerialize(value)

**Purpose**: Serialize JavaScript value to JSON string

**Parameters**:
- `value` (any): Value to serialize

**Returns**: string (JSON)

**Use Case**: Custom serializer for useLocalStorage hook

#### jsonDeserialize(value)

**Purpose**: Deserialize JSON string to JavaScript value

**Parameters**:
- `value` (string): JSON string to parse

**Returns**: any (parsed value)

**Use Case**: Custom deserializer for useLocalStorage hook

---

### Airport Information Utilities

**Module**: `src/components/Search/AirportInformation.js`

#### airportFilter(value)

**Purpose**: Filter AirportsData.json for autocomplete

**Parameters**:
- `value` (string): Search text

**Returns**: Array of matching airport objects

**Use Case**: Client-side airport autocomplete fallback

#### airportInformation(value)

**Purpose**: Format airport information for display

**Parameters**:
- `value` (string): Airport code or name

**Returns**: Formatted string

**Use Case**: Display formatted airport labels

#### airportBackendFilter(value)

**Purpose**: Filter backend airport results

**Parameters**:
- `value` (string): Search text

**Returns**: Array of filtered airports

**Use Case**: Post-process backend autocomplete results

---

## Data Models

### Flight Object

**Used In**: Cart, search results, trip cards

**Fields** (inferred from usage):
```javascript
{
  flightId: string,          // Unique identifier
  origin: string,            // Origin airport code
  destination: string,       // Destination airport code
  departureTime: string,     // Departure time
  arrivalTime: string,       // Arrival time
  departureDate: string,     // Departure date
  returnDate: string|null,   // Return date (null for one-way)
  price: number,             // Price in currency
  airline: string,           // Airline name
  duration: string,          // Flight duration
  seatClass: string          // Seat class
}
```

### Airport Object

**Used In**: Autocomplete, airport selection

**Fields** (inferred from AirportsData.json usage):
```javascript
{
  code: string,      // IATA airport code (e.g., "JFK")
  name: string,      // Airport name
  city: string,      // City name
  country: string    // Country name
}
```

### Cart Storage Model

**localStorage key**: `cart`

**Structure**: JSON array of Flight objects

**Persistence**: Automatic via useLocalStorage hook

**Serialization**: Custom jsonSerialize/jsonDeserialize functions

### Purchase History Model

**localStorage key**: `pastCart`

**Structure**: JSON array of Flight objects

**Purpose**: Track completed purchases

**Update Trigger**: purchaseCart() method

---

## API Integration Patterns

### Development vs Production

**Development**:
- setupProxy.js intercepts /flightsearchapi and /tracingapi
- Proxies to environment variable URLs
- No CORS issues

**Production**:
- NGINX configuration template (default.conf.template)
- Environment variable substitution at container startup
- Proxies same paths to configured backend URLs

### Error Handling Pattern

```javascript
try {
  const result = await apiCall();
  // Process result
} catch (error) {
  console.error(error);
  // Component handles error state
}
```

### Loading State Pattern

```javascript
const [loading, setLoading] = useState(false);

async function fetchData() {
  setLoading(true);
  try {
    const data = await apiCall();
    // Process data
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}
```

### Trace Propagation Pattern

- Automatic via FetchInstrumentation
- Trace headers added to all fetch() calls
- Backend correlates traces via propagated context
- No manual header management required
