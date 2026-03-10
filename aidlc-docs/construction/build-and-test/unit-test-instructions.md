# Unit Test Execution

## Overview

Unit tests validate individual components, services, and utilities in isolation. The FlyFast-WebUI project uses:
- **Test Framework**: Jest (included with Create React App)
- **Testing Library**: @testing-library/react v13
- **Test Files**: `*.test.tsx` files co-located with source code
- **Coverage Target**: Improve from current <5% baseline

---

## Run Unit Tests

### 1. Execute All Unit Tests

```bash
npm test
```

**Expected Interactive Output**:
```
PASS src/App.test.tsx
  ✓ renders learn react link (50ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.456 s
Ran all test suites.

Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press q to quit watch mode.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press Enter to trigger a test run.
```

**Exit Watch Mode**: Press `q` to quit

---

### 2. Execute Tests Non-Interactively (CI Mode)

For automated validation or CI/CD:

```bash
npm test -- --coverage --watchAll=false
```

**Expected Output**:
```
PASS src/App.test.tsx
  ✓ renders learn react link (45ms)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |   5.12  |    2.34  |   4.87  |   5.23  |                   
----------|---------|----------|---------|---------|-------------------

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        4.234 s
```

---

### 3. Execute Specific Test File

To run a single test file:

```bash
npm test -- App.test.tsx --watchAll=false
```

Or use pattern matching:

```bash
npm test -- --testPathPattern=Search --watchAll=false
```

---

## Test File Inventory

### Existing Tests

1. **src/App.test.tsx**
   - **Purpose**: Smoke test for main App component
   - **Coverage**: Renders without crashing, checks for "FlyFast" text
   - **Status**: Converted to TypeScript, passing

### Missing Tests (To Be Created)

**High Priority** - Critical Business Logic:

2. **src/services/Flight.test.ts**
   - Test `searchFlight()` API call
   - Test `airportTypeAhead()` API call
   - Mock fetch responses
   - Validate response parsing

3. **src/services/Context.test.tsx**
   - Test `CartProvider` initialization
   - Test `addToCart()` functionality
   - Test `removeFromCart()` functionality
   - Test localStorage persistence
   - Test cart state updates

4. **src/components/Search/Search.test.tsx**
   - Test form input validation
   - Test date range selection
   - Test airport autocomplete
   - Test form submission with valid data
   - Test navigation after search

5. **src/components/TripCard/TripCard.test.tsx**
   - Test flight details rendering
   - Test "Add to Cart" action
   - Test fare calculation display
   - Test expand/collapse functionality

6. **src/components/Cart/Cart.test.tsx**
   - Test empty cart message
   - Test cart items display
   - Test remove from cart action

**Medium Priority** - Supporting Components:

7. **src/services/Functions.test.ts**
   - Test `jsonSerialize()` with complex objects
   - Test `jsonDeserialize()` with valid/invalid JSON
   - Test `timeConversion()` formatting
   - Test `timeDifference()` calculations

8. **src/components/SearchResults/SearchResults.test.tsx**
   - Test results rendering with data
   - Test empty results scenario
   - Test "Proceed to Checkout" button

9. **src/pages/Checkout/Checkout.test.tsx**
   - Test stepper navigation
   - Test cart review step
   - Test cost calculation step
   - Test confirmation step

**Low Priority** - Presentational Components:

10. **src/components/ApplicationHeader.test.tsx**
    - Test theme toggle
    - Test navigation links
    - Test cart link display

---

## Review Test Results

### Success Criteria
- ✅ All existing tests pass (1/1 currently)
- ✅ No test failures or errors
- ✅ Test execution time < 10 seconds for current suite
- ✅ Exit code 0 from npm test

### Test Coverage Goals
- **Current**: ~5% code coverage
- **Target**: >60% code coverage (aspirational)
- **Critical Paths**: Cart operations, search flow, checkout process

### Test Report Location
- **Terminal Output**: Real-time test results
- **Coverage Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`

To generate coverage report:
```bash
npm test -- --coverage --watchAll=false
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

---

## Fix Failing Tests

If tests fail, follow this process:

### 1. Identify Failing Test
```
FAIL src/App.test.tsx
  ✕ renders learn react link (89ms)

  ● renders learn react link

    TestingLibraryElementError: Unable to find an element with the text: /flyfast/i
```

### 2. Review Error Details
- **Error Type**: TestingLibraryElementError
- **Cause**: Expected text not found
- **File**: src/App.test.tsx
- **Line**: [line number in stack trace]

### 3. Fix Code Issues
Options:
- Fix test: Update test expectation to match actual rendered output
- Fix code: Update component to render expected content
- Fix data-testid: Use data-testid attributes for stable selectors

### 4. Rerun Tests
```bash
npm test -- App.test.tsx --watchAll=false
```

### 5. Verify Fix
- Test passes with green checkmark
- No new failures introduced
- Coverage maintained or improved

---

## Test Best Practices

### Use data-testid Attributes
All interactive elements have `data-testid` attributes for stable testing:
```typescript
// Example: Search form
<form data-testid="search-form">
  <input data-testid="search-from-input" />
  <button data-testid="search-submit-button">Search</button>
</form>
```

### Mock External Dependencies
```typescript
// Mock API calls
jest.mock('../services/Flight', () => ({
  searchFlight: jest.fn().mockResolvedValue([]),
  airportTypeAhead: jest.fn().mockResolvedValue([])
}));
```

### Test User Interactions
```typescript
import { render, fireEvent } from '@testing-library/react';

const { getByTestId } = render(<Search />);
const submitButton = getByTestId('search-submit-button');
fireEvent.click(submitButton);
```

---

## Troubleshooting

### Tests Timeout or Hang

**Symptom**: Test runs indefinitely without completing

**Solution**:
```bash
# Increase timeout
npm test -- --testTimeout=10000 --watchAll=false
```

---

### Module Not Found Errors

**Symptom**:
```
Cannot find module '@testing-library/react'
```

**Solution**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest
npm test
```

---

### TypeScript Type Errors in Tests

**Symptom**:
```
TS2322: Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
```

**Solution**: Add type guards or non-null assertions:
```typescript
const button = getByTestId('submit-button');
expect(button).toBeInTheDocument(); // Type guard
```

---

## Next Steps

After all unit tests pass:
1. Review coverage report
2. Identify untested critical paths
3. Proceed to **Integration Tests** (see integration-test-instructions.md)
