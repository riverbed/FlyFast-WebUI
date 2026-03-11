# Unit 1: Service Layer Tests - Functional Design

**Unit**: Service Layer Tests  
**Scope**: Testing core services (Flight.ts, Functions.ts, Context.tsx, Tracing.ts, CustomTracing.ts)  
**Target Coverage**: 70%+ for service layer  
**Status**: Design Complete

---

## Business Logic Overview

The FlyFast service layer provides three critical capabilities:

### 1. **Flight Search & Airport Services** (Flight.ts)
Core business transactions for flight discovery and airport lookup.

**Functions**:
- `searchFlight()`: Queries flight availability based on travel criteria
  - **Inputs**: from, to, departureDate, returnDate, seatType
  - **Outputs**: Grouped trip results (TripResult[][])
  - **Error Handling**: Fetch failure, malformed response
  - **Edge Cases**: Null inputs, missing return date, one-way trips

- `airportTypeAhead()`: Auto-completes airport search
  - **Inputs**: search text, optional limit
  - **Outputs**: Matching airports (Airport[])
  - **Error Handling**: Empty search, network failure
  - **Edge Cases**: Null text, limit parameter omitted

### 2. **Cart Management** (Context.tsx)
React Context provider for shopping cart state and localStorage persistence.

**Functions**:
- `CartProvider`: Wraps app with cart state
- `addToCart()`: Appends flight segments to cart
- `removeFromCart()`: Removes flight by index
- `purchaseCart()`: Archives cart and clears it

**Business Rules**:
- Cart persisted to localStorage
- Multiple flight segments allowed
- Purchase moves cart to pastCart and clears active cart
- Cart can have gaps (indices shift after removal)

### 3. **Utility Functions** (Functions.ts)
Support functions for data transformation and serialization.

**Functions**:
- `timeConversion()`: Formats dates using Intl API
- `timeDifference()`: Calculates flight duration
- `jsonSerialize()`: Safe JSON stringification
- `jsonDeserialize()`: Safe JSON parsing

**Business Rules**:
- Date formatting follows browser locale
- Duration in hours/minutes format
- Serialization errors don't crash app
- Deserialization returns empty array on failure

### 4. **OpenTelemetry Tracing** (Tracing.ts, CustomTracing.ts)
Observability infrastructure for monitoring application performance.

**Functions**:
- `Tracing()`: Initializes OTEL provider and instrumentations
- `customTracing()`: Wraps promises with span tracking

**Business Rules**:
- Production uses batch span processor
- Development uses console + OTEL exporters
- Traces include HTTP context and location info
- Instrumentation covers fetch, XHR, document load, user interactions

---

## Test Strategy

### Test Layers (Pyramid)

```
          Integration Tests (3)
       Component Interaction Tests (5)
      Isolated Service Tests (12+)
       Type Safety Tests (inline)
       Mock Infrastructure (shared)
```

### Service Test Coverage Plan

#### **Flight.ts Tests (5 scenarios)**

| Test Case | Purpose | Mock Strategy | Assertions |
|-----------|---------|---------------|-----------|
| `searchFlight - Success` | Valid round-trip search | Mock fetch → response | Returns TripResult[][] |
| `searchFlight - One-way` | No return date | Mock fetch → response | Return date not in params |
| `searchFlight - Null inputs` | Graceful handling | Mock fetch → response | Empty string defaults applied |
| `searchFlight - Network error` | Fetch rejection | Mock fetch → throw | Error propagates |
| `airportTypeAhead - Success` | Airport lookup | Mock fetch → airports | Returns Airport[] |
| `airportTypeAhead - Empty text` | Early return | No fetch call | Returns [] immediately |
| `airportTypeAhead - With limit` | Limit parameter | Mock fetch | Limit in query params |

#### **Context.tsx Tests (6 scenarios)**

| Test Case | Purpose | Mock Strategy | Assertions |
|-----------|---------|---------------|-----------|
| `CartProvider - Initialization` | Provider renders | Mock useLocalStorage | Provider accessible via context |
| `addToCart - Single item` | Add to empty cart | useLocalStorage mock | Cart has 1 item |
| `addToCart - Multiple items` | Append to existing | useLocalStorage mock | Cart has N items |
| `removeFromCart - Valid index` | Remove by index | useLocalStorage mock | Item removed, indices shift |
| `removeFromCart - Boundary` | First/last items | useLocalStorage mock | Correct items removed |
| `purchaseCart - Archive` | Move to history | useLocalStorage mock | cart cleared, pastCart updated |
| `localStorage - Persistence` | Round-trip storage | useLocalStorage mock | Serialization/deserialization works |

#### **Functions.ts Tests (4 scenarios)**

| Test Case | Purpose | Mock Strategy | Assertions |
|-----------|---------|---------------|-----------|
| `timeConversion - Valid date` | Format success | Pass valid Date | Returns formatted string |
| `timeConversion - Locale` | Locale-aware | Browser locale | Uses correct locale format |
| `timeDifference - Valid times` | Duration calc | Two valid dates | Returns "X Hours Y Minutes" |
| `timeDifference - Same time` | Zero duration | Identical times | Returns "0 Minutes" |
| `jsonSerialize - Valid object` | Safe stringify | Complex objects | Returns valid JSON string |
| `jsonSerialize - Error handling` | Circular ref | Circular object | Error caught, empty string returned |
| `jsonDeserialize - Valid JSON` | Safe parse | Valid JSON | Returns parsed object |
| `jsonDeserialize - Invalid JSON` | Error handling | Invalid JSON | Returns empty array |

#### **Tracing.ts & CustomTracing.ts Tests (3-4 scenarios)**

| Test Case | Purpose | Mock Strategy | Assertions |
|-----------|---------|---------------|-----------|
| `Tracing - Production config` | Batch processor | Mock env=production | BatchSpanProcessor used |
| `Tracing - Development config` | Console exporter | Mock env=development | Both console and OTEL exporters |
| `customTracing - Span creation` | Wrap promise | Mock tracer | Span created with attrs |
| `customTracing - Error handling` | Failed promise | Mock promise reject | Error captured in span |

---

## Mocking Strategy

### External Dependencies to Mock

1. **Global fetch API**
   - Replace with Jest mock
   - Configure per test case
   - Return realistic response shapes

2. **@mantine/hooks.useLocalStorage**
   - Mock hook to track state
   - Simulate persistence behavior
   - Enable serialization testing

3. **@opentelemetry modules**
   - Mock provider, tracer, span
   - Verify instrumentation registration
   - Skip actual network calls

4. **Browser APIs** (localStorage, window, location)
   - Mock via jsdom
   - Already configured in vitest setup

### Test Data Design

**Airport Test Data**:
```typescript
const mockAirports: Airport[] = [
  // Derived from src/components/Search/AirportsData.json entries.
  { code: "CHP", name: "CHP Airport", city: "Aquamarine", country: "Java Kotlin Empire" },
  { code: "SIL", name: "SIL Airport", city: "Ruby", country: "Swift Empire" },
  { code: "VLM", name: "VLM Airport", city: "Turquoise", country: "Go Empire" }
];
```

**Flight Test Data**:
```typescript
const mockTripResult: TripResult[][] = [
  // TripResult[0]: destination flights (supports one-way and outbound of round trip)
  [
    {
      from: "CHP",
      to: "SIL",
      flights: [
        {
          flightNumber: "FF123",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T08:00:00Z",
          arrivalTime: "2024-07-01T12:00:00Z",
          from: "CHP",
          to: "SIL",
          seat: "Economy",
          fare: 199.99,
        },
      ],
      departureTime: "2024-07-01T08:00:00Z",
      arrivalTime: "2024-07-01T12:00:00Z",
      fare: 199.99,
    },
    {
      from: "CHP",
      to: "SIL",
      flights: [
        {
          flightNumber: "FF352",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T03:00:00Z",
          arrivalTime: "2024-07-01T05:00:00Z",
          from: "CHP",
          to: "VLM",
          seat: "Economy",
          fare: 40.99,
        },
        {
          flightNumber: "FF632",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T08:00:00Z",
          arrivalTime: "2024-07-01T10:00:00Z",
          from: "VLM",
          to: "SIL",
          seat: "Economy",
          fare: 50.99,
        },
      ],
      departureTime: "2024-07-01T03:00:00Z",
      arrivalTime: "2024-07-01T10:00:00Z",
      fare: 90.98,
    },
  ],
  // TripResult[1]: return flights (round-trip only)
  [
    {
      from: "SIL",
      to: "CHP",
      flights: [
        {
          flightNumber: "FF124",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-07T08:00:00Z",
          arrivalTime: "2024-07-07T12:00:00Z",
          from: "SIL",
          to: "CHP",
          seat: "Economy",
          fare: 189.99,
        },
      ],
      departureTime: "2024-07-07T08:00:00Z",
      arrivalTime: "2024-07-07T12:00:00Z",
      fare: 189.99,
    },
  ],
];
```

**Cart Test Data**:
```typescript
const mockCart: FlightSegment[] = [mockFlightSegment];
```

---

## Test File Structure

```
src/services/
├── __tests__/
│   ├── Flight.test.ts          (7 tests)
│   ├── Functions.test.ts        (8 tests)
│   ├── Context.test.tsx         (7 tests)
│   ├── Tracing.test.ts          (4 tests)
│   └── CustomTracing.test.ts    (3 tests)
└── [service files]
```

---

## Coverage Targets

| Service | Target | Method |
|---------|--------|--------|
| Flight.ts | 90%+ | Test all paths: success, null inputs, errors |
| Context.tsx | 100%+ | Hook behavior, localStorage mock |
| Functions.ts | 100% | All utility functions + edge cases |
| Tracing.ts | 80%+ | Config branches, instrumentation registration |
| CustomTracing.ts | 80%+ | Span creation, error handling |
| **Total Services** | **70%+** | Full coverage of export surface |

---

## Dependencies & Setup

### Testing Libraries (Existing in package.json)
- ✅ vitest (test runner)
- ✅ @testing-library/react (component testing)
- ✅ @testing-library/jest-dom (matchers)
- ✅ jsdom (browser environment)

### Mock Utilities
- `vi.mock()` for module mocking
- `vi.fn()` for function spies
- `setupTests.ts` for global setup

### Test Patterns

**Pattern 1: Service function test**
```typescript
describe("serviceFunction", () => {
  it("should handle success case", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ json: async () => mockData });
    const result = await serviceFunction(...args);
    expect(result).toEqual(expected);
  });
});
```

**Pattern 2: Context hook test**
```typescript
const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
renderHook(() => useContext(CartContext), { wrapper });
```

---

## Success Criteria for Unit 1

- [ ] All 5 Flight tests passing
- [ ] All 7 Context tests passing
- [ ] All 8 Functions tests passing
- [ ] All 4 Tracing tests passing
- [ ] All 3 CustomTracing tests passing
- [ ] Service layer coverage: 70%+
- [ ] No type errors
- [ ] All mocks properly isolated
- [ ] Test execution: <5 seconds
