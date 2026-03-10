# Integration Test Instructions

## Purpose

Integration tests validate that multiple units/components work together correctly. Unlike unit tests that test components in isolation, integration tests verify:
- Component interactions and data flow
- Context provider and consumer relationships
- API integration and data fetching
- Navigation and routing
- End-to-end user workflows

---

## Integration Test Strategy

### Scope
FlyFast-WebUI is a single-page application with the following integration points:
1. **Cart Context** ↔ Multiple Components (Cart, TripCard, Checkout)
2. **API Services** ↔ UI Components (Search, SearchResults)
3. **React Router** ↔ Page Components (Home, SearchFlight, Checkout)
4. **OpenTelemetry Tracing** ↔ Application Lifecycle

---

## Test Scenarios

### Scenario 1: Cart Context Integration

**Description**: Verify cart state is shared correctly across components

**Components Tested**:
- `CartProvider` (Context.tsx)
- `TripCard` (add to cart action)
- `Cart` (display cart items)
- `Checkout` (cart review)

**Test Steps**:
1. Render application with `CartProvider`
2. Navigate to search results
3. Click "Add to Cart" on a TripCard
4. Verify cart state updates in Cart component
5. Navigate to Checkout page
6. Verify cart items appear in checkout flow

**Expected Results**:
- Cart state persists across components
- Adding flight updates cart count
- Cart items visible in both Cart and Checkout components
- localStorage contains serialized cart data

**Test Implementation**:
```typescript
// src/integration/CartIntegration.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApplicationContainer from '../components/ApplicationContainer/ApplicationContainer';
import { searchFlight } from '../services/Flight';

jest.mock('../services/Flight');

test('Cart integration: Add flight to cart and view in checkout', async () => {
  // Mock API response
  (searchFlight as jest.Mock).mockResolvedValue([[mockFlightData]]);
  
  const { getByTestId, getByText } = render(
    <BrowserRouter>
      <ApplicationContainer>
        <App />
      </ApplicationContainer>
    </BrowserRouter>
  );
  
  // Navigate to search
  fireEvent.click(getByTestId('search-submit-button'));
  
  // Wait for results
  await waitFor(() => getByTestId('trip-card-add-to-cart-button'));
  
  // Add to cart
  fireEvent.click(getByTestId('trip-card-add-to-cart-button'));
  
  // Verify cart updated
  expect(getByText(/1 item/i)).toBeInTheDocument();
  
  // Navigate to checkout
  fireEvent.click(getByTestId('header-checkout-link'));
  
  // Verify flight appears in checkout
  expect(getByText(mockFlightData.from)).toBeInTheDocument();
});
```

**Cleanup**:
```typescript
afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

---

### Scenario 2: Search and Results API Integration

**Description**: Verify search form submits correctly and displays API results

**Components Tested**:
- `Search` (search form)
- `searchFlight` (API service)
- `SearchResults` (results display)
- React Router (navigation)

**Test Steps**:
1. Render Home page with Search component
2. Fill in search form (from, to, dates)
3. Submit search
4. Verify API called with correct parameters
5. Verify navigation to /searchflights with query params
6. Verify results rendered in SearchResults component

**Expected Results**:
- Search form submits with valid data
- `searchFlight()` API called with form values
- URL updates with query parameters
- Search results display returned flights
- Empty state shown if no results

**Test Implementation**:
```typescript
// src/integration/SearchIntegration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';
import SearchFlight from '../pages/SearchFlight/SearchFlight';
import { searchFlight } from '../services/Flight';

jest.mock('../services/Flight');

test('Search integration: Submit search and view results', async () => {
  // Mock API response
  const mockResults = [[
    { from: 'JFK', to: 'LAX', fare: 350, departureTime: '2026-03-15T10:00:00', arrivalTime: '2026-03-15T13:30:00' }
  ]];
  (searchFlight as jest.Mock).mockResolvedValue(mockResults);
  
  const { getByTestId, getByText, rerender } = render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
  
  // Fill search form
  const fromInput = getByTestId('search-from-input');
  const toInput = getByTestId('search-to-input');
  fireEvent.change(fromInput, { target: { value: 'JFK' } });
  fireEvent.change(toInput, { target: { value: 'LAX' } });
  
  // Submit search
  fireEvent.click(getByTestId('search-submit-button'));
  
  // Verify API called
  await waitFor(() => {
    expect(searchFlight).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'JFK', to: 'LAX' })
    );
  });
  
  // Rerender with SearchFlight component
  rerender(
    <BrowserRouter>
      <SearchFlight />
    </BrowserRouter>
  );
  
  // Verify results displayed
  await waitFor(() => {
    expect(getByText(/JFK/i)).toBeInTheDocument();
    expect(getByText(/LAX/i)).toBeInTheDocument();
  });
});
```

---

### Scenario 3: Checkout Flow Integration

**Description**: Complete end-to-end checkout process

**Components Tested**:
- `Cart` (cart review)
- `Cost` (price calculation)
- `Confirmation` (order confirmation)
- `Checkout` (stepper navigation)

**Test Steps**:
1. Add flights to cart
2. Navigate to checkout
3. Review cart items
4. Proceed to cost calculation step
5. Verify tax and total calculations
6. Proceed to confirmation
7. Verify order summary

**Expected Results**:
- Stepper advances through all steps
- Cart items carry through all steps
- Tax calculated correctly (8.75%)
- Total = Subtotal + Tax
- Confirmation shows final summary

**Test Implementation**:
```typescript
// src/integration/CheckoutIntegration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../pages/Checkout/Checkout';
import { CartContext } from '../services/Context';

test('Checkout integration: Complete checkout flow', () => {
  const mockCart = [
    { from: 'JFK', to: 'LAX', fare: 350, departureTime: '...', arrivalTime: '...' }
  ];
  
  const { getByTestId, getByText } = render(
    <BrowserRouter>
      <CartContext.Provider value={{ cart: mockCart, addToCart: jest.fn(), removeFromCart: jest.fn() }}>
        <Checkout />
      </CartContext.Provider>
    </BrowserRouter>
  );
  
  // Step 1: Cart review
  expect(getByText(/JFK/i)).toBeInTheDocument();
  fireEvent.click(getByTestId('checkout-proceed-button'));
  
  // Step 2: Cost calculation
  expect(getByText(/Subtotal.*350/i)).toBeInTheDocument();
  expect(getByText(/Tax.*30.63/i)).toBeInTheDocument(); // 350 * 0.0875
  expect(getByText(/Total.*380.63/i)).toBeInTheDocument();
  fireEvent.click(getByTestId('checkout-proceed-button'));
  
  // Step 3: Confirmation
  expect(getByText(/Confirmation/i)).toBeInTheDocument();
  expect(getByText(/Thank you/i)).toBeInTheDocument();
});
```

---

### Scenario 4: Router Navigation Integration

**Description**: Verify routing between pages works correctly

**Components Tested**:
- `App` (router configuration)
- `ApplicationHeader` (navigation links)
- All page components

**Test Steps**:
1. Start at Home page (/)
2. Click header logo to return home
3. Navigate to /searchflights
4. Navigate to /checkout
5. Verify URL updates
6. Verify correct page component renders

**Expected Results**:
- URL matches expected route
- Correct page component displayed
- Navigation links functional
- Browser back/forward works
- Lazy loading doesn't break navigation

**Test Implementation**:
```typescript
// src/integration/RouterIntegration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

test('Router integration: Navigate between pages', async () => {
  const { getByTestId, getByText } = render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  
  // Start at Home
  await waitFor(() => expect(getByTestId('search-form')).toBeInTheDocument());
  
  // Navigate to checkout via header
  fireEvent.click(getByTestId('header-checkout-link'));
  
  // Verify checkout page rendered
  await waitFor(() => expect(getByText(/Checkout/i)).toBeInTheDocument());
  
  // Navigate back to home via logo
  fireEvent.click(getByTestId('header-home-link'));
  
  // Verify home page rendered
  await waitFor(() => expect(getByTestId('search-form')).toBeInTheDocument());
});
```

---

## Setup Integration Test Environment

### 1. Install Test Dependencies

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Already installed during Unit 2 Code Generation ✅

---

### 2. Configure Test Environment

Create `src/setupTests.ts` (already exists):
```typescript
import '@testing-library/jest-dom';
```

---

### 3. Mock External Services

Create `src/__mocks__/` directory for service mocks:

```typescript
// src/__mocks__/Flight.ts
export const searchFlight = jest.fn().mockResolvedValue([]);
export const airportTypeAhead = jest.fn().mockResolvedValue([]);
```

---

## Run Integration Tests

### Execute All Integration Tests

```bash
npm test -- --testPathPattern=integration --watchAll=false
```

---

### Execute Specific Integration Test

```bash
npm test -- CartIntegration.test.tsx --watchAll=false
```

---

### Run with Coverage

```bash
npm test -- --coverage --testPathPattern=integration --watchAll=false
```

---

## Verify Service Interactions

### Check API Mocks

Verify `searchFlight` and `airportTypeAhead` are called with expected parameters:
```typescript
expect(searchFlight).toHaveBeenCalledWith({
  from: 'JFK',
  to: 'LAX',
  departureDate: '2026-03-15',
  returnDate: '2026-03-20',
  seatClass: 'Economy'
});
```

---

### Check Context Updates

Verify cart state persists across components:
```typescript
expect(localStorage.getItem('cart')).toContain('JFK');
```

---

### Check Navigation

Verify URL updates after form submission:
```typescript
expect(window.location.pathname).toBe('/searchflights');
expect(window.location.search).toContain('from=JFK');
```

---

## Integration Test Results

### Success Criteria
- ✅ All integration scenarios pass
- ✅ Components communicate correctly
- ✅ Context state shared properly
- ✅ API integration works
- ✅ Navigation flows complete
- ✅ No console errors or warnings

### Expected Test Count
- Minimum: 4 integration test scenarios
- Coverage: Major user workflows covered

---

## Cleanup

After each test, reset state:

```typescript
afterEach(() => {
  // Clear localStorage
  localStorage.clear();
  
  // Reset mocks
  jest.clearAllMocks();
  
  // Reset router
  window.history.pushState({}, '', '/');
});
```

---

## Troubleshooting

### Router Not Updating

**Issue**: Navigation doesn't change URL

**Solution**: Use `MemoryRouter` for tests instead of `BrowserRouter`:
```typescript
import { MemoryRouter } from 'react-router-dom';
```

---

### Context Not Available

**Issue**: `useContext` returns undefined

**Solution**: Wrap test component in `CartProvider`:
```typescript
render(
  <CartProvider>
    <ComponentUnderTest />
  </CartProvider>
);
```

---

### Async State Updates

**Issue**: State not updated before assertion

**Solution**: Use `waitFor` from @testing-library/react:
```typescript
await waitFor(() => {
  expect(getByText(/expected text/i)).toBeInTheDocument();
});
```

---

## Next Steps

After integration tests pass:
1. Review integration test results
2. Verify all critical workflows covered
3. Optionally proceed to **Performance Tests** (see performance-test-instructions.md)
4. Review overall **Build and Test Summary** (see build-and-test-summary.md)
