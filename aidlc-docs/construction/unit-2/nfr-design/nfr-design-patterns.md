# NFR Design Patterns - Unit 2: TypeScript Conversion

**Unit**: Unit 2 - TypeScript Conversion  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-09  

---

## Executive Summary

This document defines 7 design patterns that incorporate non-functional requirements into Unit 2's TypeScript conversion. These patterns ensure safe, maintainable, and performant migration of 29+ JavaScript files to TypeScript with strict type checking while preserving all existing functionality and UI/UX.

All patterns are derived from NFR requirements decisions: layered conversion (1B), pragmatic type escapes (2C), full strict enforcement (3A), type-clean definition of done (4C), broad `any` wrappers for external libs (5C), aggressive performance targets (6A), comprehensive validation (7A), and minimal documentation (8C).

---

## Pattern 1: Layered Conversion Sequencing

**Pattern Name**: Five-Phase Bottom-Up Conversion  
**Category**: Conversion Safety & Delivery Risk Control  
**Decision Source**: NFR Requirements Q1=B (Layered approach)

### Problem
Converting 29+ files simultaneously creates high risk of cascading type errors and makes debugging difficult. Converting one file at a time is too slow and doesn't establish shared patterns early. Need balance between safety, speed, and pattern establishment.

### Solution
Execute conversion in 5 sequential phases, each building on established patterns from previous phases:

#### Phase 1: Shared Services & Utilities (Foundation Layer)
**Files**: 5 files in `src/services/`
- ✅ `Functions.ts` (completed in Unit 1 as proof-of-concept)
- `Context.js` → `Context.tsx` (React Context API with provider)
- `Flight.js` → `Flight.ts` (API service layer)
- `Tracing.js` → `Tracing.ts` (OpenTelemetry initialization)
- `CustomTracing.js` → `CustomTracing.ts` (Custom tracing utilities)

**Pattern Establishment**:
- API response type interfaces (`Flight`, `SearchParams`, `Airport`)
- Service function type signatures
- Context type patterns for state management
- OpenTelemetry configuration typing

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Type-check time measured (baseline for performance tracking)
- ✅ Git commit: "Unit 2 Phase 1: Convert services to TypeScript"

---

#### Phase 2: Root Infrastructure (Entry Points)
**Files**: 5 files in `src/` root
- `index.js` → `index.tsx` (React app entry point)
- `reportWebVitals.js` → `reportWebVitals.ts` (Web Vitals reporting)
- `setupProxy.js` → `setupProxy.ts` (HTTP proxy middleware config)
- `setupTests.js` → `setupTests.ts` (Jest/testing-library setup)
- `App.test.js` → `App.test.tsx` (App component test)

**Pattern Establishment**:
- React render typing (`root.render()`)
- Express middleware typing for proxy setup
- Jest configuration typing
- Testing library type patterns

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ `npm start` launches dev server without errors
- ✅ Type-check time < 5s incremental (performance check)
- ✅ Git commit: "Unit 2 Phase 2: Convert infrastructure to TypeScript"

---

#### Phase 3: Shared Components (Dependency Layer)
**Files**: ~17 files in `src/components/`

**Batch 3A - Application Container** (2 files):
- `ApplicationContainer/ApplicationContainer.js` → `.tsx`
- `ApplicationContainer/ApplicationHeader.js` → `.tsx`

**Batch 3B - Authentication** (1 file):
- `Authentication/Username.js` → `.tsx`

**Batch 3C - Search Components** (3 files):
- `Search/Search.js` → `.tsx`
- `Search/AirportInformation.js` → `.tsx`
- Keep JSON data files as-is: `AirportsData.json`, `SeatData.json`, `TripData.json`

**Batch 3D - Display Components** (8 files):
- `TripCard/TripCard.js` → `.tsx`
- `TripCard/FlightDetails.js` → `.tsx`
- `Flight/Flight.js` → `.tsx`
- `Cart/Cart.js` → `.tsx`
- `Cart/EmptyCart.js` → `.tsx`
- `Cart/FlightDetails.js` → `.tsx`
- `Breakdown/Confirmation.js` → `.tsx`
- `Breakdown/Cost.js` → `.tsx`

**Batch 3E - Search Results** (3 files):
- `SearchResults/SearchResults.js` → `.tsx`
- `SearchResults/Results.js` → `.tsx`
- `SearchResults/NoResults.js` → `.tsx`

**Pattern Establishment**:
- Component props interfaces (explicit `interface ComponentNameProps`)
- React.FC vs function component patterns
- Event handler types (`React.MouseEvent`, `React.ChangeEvent`)
- State hook types (`useState<Type>`)
- Mantine component prop typing

**Quality Gate Per Batch**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Visual verification of affected components (manual test)
- ✅ Type-check time monitored (should stay < 5s incremental)
- ✅ Git commit per batch: "Unit 2 Phase 3A-E: Convert [component group] to TypeScript"

---

#### Phase 4: Page Components (Top-Level Routes)
**Files**: 3 files in `src/pages/`
- `Home/Home.js` → `Home.tsx`
- `SearchFlight/SearchFlight.js` → `SearchFlight.tsx`
- `Checkout/Checkout.js` → `Checkout.tsx`

**Pattern Establishment**:
- Page-level state management types
- React Router hook types (`useNavigate`, `useLocation`)
- Integration of multiple component types

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Full routing flow validation (Home → Search → Results → Cart → Checkout)
- ✅ All critical paths tested manually
- ✅ Git commit: "Unit 2 Phase 4: Convert pages to TypeScript"

---

#### Phase 5: Application Root
**Files**: 1 file
- `App.js` → `App.tsx`

**Pattern Establishment**:
- Top-level routing configuration types
- Provider composition types
- Application-wide context types

**Quality Gate**:
- ✅ `npm run type-check` passes (< 30s full check)
- ✅ `npm run build` succeeds
- ✅ Full application smoke test (all features)
- ✅ Comprehensive validation (Pattern 4)
- ✅ Git commit: "Unit 2 Phase 5: Convert App root to TypeScript"

---

### Implementation Guidelines

**Per-Phase Execution**:
1. Create feature branch or commit checkpoint before phase
2. Convert all files in phase following type modeling standards (Pattern 2)
3. Run automated quality gates
4. Execute manual validation for affected features
5. Commit changes with descriptive message
6. Update plan checkboxes in real-time
7. Pause for review if issues arise

**Rollback Strategy**:
- If any phase fails quality gates, revert to last passing commit
- Debug issues in isolation before retrying phase
- Document blockers and solutions in code-generation-summary.md

### Benefits
- **Foundation-first**: Services establish shared type interfaces used by components
- **Incremental validation**: Each phase tested before next begins
- **Pattern propagation**: Early phases establish patterns reused in later phases
- **Clear progress tracking**: 5 phases with explicit checkpoints
- **Risk isolation**: Problems contained to single phase

### Success Criteria
- [ ] All 5 phases completed successfully
- [ ] 29+ files converted from `.js` to `.ts`/`.tsx`
- [ ] All quality gates passed
- [ ] Git history shows clear phase progression
- [ ] Performance targets met throughout (< 5s incremental, < 30s full)

---

## Pattern 2: Strict Type Modeling Standard

**Pattern Name**: Explicit Interface-First Component Typing  
**Category**: Type Quality & Code Maintainability  
**Decision Source**: NFR Requirements Q3=A (Full strict gate), Q2=C (Pragmatic escapes)

### Problem
React components have many type variants (props, state, refs, context). Without consistent patterns, developers create inconsistent types leading to maintenance burden. Strict TypeScript catches errors but can be verbose. Need standard patterns that balance safety with developer experience.

### Solution
Establish explicit type modeling standards for all common React patterns, with clear examples for each scenario.

#### Component Props Pattern

**Standard Interface Definition**:
```typescript
interface ComponentNameProps {
  // Required props (no ?)
  title: string;
  id: number;
  
  // Optional props (with ?)
  subtitle?: string;
  className?: string;
  
  // Callback props
  onClick: (id: number) => void;
  onSearch: (query: string) => Promise<void>;
  
  // Complex object props
  flight: Flight; // Imported from service layer types
  
  // Union types for enums
  status: 'idle' | 'loading' | 'success' | 'error';
  
  // Array props
  items: string[];
  flights: Flight[];
  
  // Children prop
  children?: React.ReactNode;
}

// Component definition
export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  id,
  subtitle = 'Default value',
  onClick,
  children,
}) => {
  return (
    <div onClick={() => onClick(id)}>
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
      {children}
    </div>
  );
};
```

**Alternative Function Component Pattern** (when not using React.FC):
```typescript
export function ComponentName({ title, id }: ComponentNameProps) {
  return <div>{title}</div>;
}
```

---

#### State Management Pattern

**React useState Hook**:
```typescript
// Primitive state (inferred)
const [count, setCount] = useState(0); // Type: number
const [isOpen, setIsOpen] = useState(false); // Type: boolean

// State with null/undefined initial value (explicit type)
const [user, setUser] = useState<User | null>(null);
const [error, setError] = useState<string | undefined>(undefined);

// Complex object state
interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
  errors: Record<string, string>;
}

const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  rememberMe: false,
  errors: {},
});

// Array state
const [flights, setFlights] = useState<Flight[]>([]);

// Partial updates (using spread)
const updateForm = (field: keyof FormState, value: any) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
```

---

#### Event Handler Pattern

**Common React Event Types**:
```typescript
// Button click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  console.log('Button clicked');
};

// Form submission
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Handle form submit
};

// Input change
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Handle input change
};

// Select/dropdown change
const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedValue = e.target.value;
};

// Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    // Handle Enter key
  }
};

// Generic event handler type alias (for reuse)
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const EmailInput = ({ onChange }: { onChange: InputChangeHandler }) => {
  return <input type="email" onChange={onChange} />;
};
```

---

#### Context API Pattern

**Type-Safe Context Definition** (`Context.tsx`):
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// Define context value interface
interface AppContextValue {
  flights: Flight[];
  selectedFlight: Flight | null;
  cartItems: Flight[];
  searchParams: SearchParams | null;
  
  // Action methods
  addToCart: (flight: Flight) => void;
  removeFromCart: (flightId: string) => void;
  setSearchParams: (params: SearchParams) => void;
  updateSelectedFlight: (flight: Flight | null) => void;
}

// Create context with undefined initial value
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component props
interface AppProviderProps {
  children: ReactNode;
}

// Provider implementation
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [cartItems, setCartItems] = useState<Flight[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  
  const addToCart = (flight: Flight) => {
    setCartItems(prev => [...prev, flight]);
  };
  
  const removeFromCart = (flightId: string) => {
    setCartItems(prev => prev.filter(f => f.id !== flightId));
  };
  
  const updateSelectedFlight = (flight: Flight | null) => {
    setSelectedFlight(flight);
  };
  
  const value: AppContextValue = {
    flights,
    selectedFlight,
    cartItems,
    searchParams,
    addToCart,
    removeFromCart,
    setSearchParams,
    updateSelectedFlight,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Type-safe custom hook
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

---

#### API Service Pattern

**API Response and Service Function Types** (`Flight.ts`):
```typescript
// Domain models
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO 8601 datetime
  arrivalTime: string;   // ISO 8601 datetime
  duration: number;      // minutes
  flightNumber: string;
  airline: string;
}

export interface Flight {
  id: string;
  outboundSegments: FlightSegment[];
  returnSegments?: FlightSegment[]; // Only for round-trip
  price: number;
  currency: string;
  seatClass: 'economy' | 'premium-economy' | 'business' | 'first';
  availableSeats: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string; // ISO 8601 date
  returnDate?: string;   // Only for round-trip
  passengers: number;
  seatClass: string;
  tripType: 'one-way' | 'round-trip';
}

// API response wrappers
export interface SearchResponse {
  flights: Flight[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookingResponse {
  bookingId: string;
  status: 'confirmed' | 'pending' | 'failed';
  confirmationCode: string;
}

// Service functions with explicit types
export const searchFlights = async (
  params: SearchParams
): Promise<SearchResponse> => {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json() as Promise<SearchResponse>;
};

export const bookFlight = async (
  flightId: string,
  passengers: any // Using pragmatic `any` for complex passenger data
): Promise<BookingResponse> => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightId, passengers }),
  });
  
  return response.json() as Promise<BookingResponse>;
};
```

---

### Implementation Guidelines

1. **Always define explicit interfaces** for component props (never use inline types)
2. **Prefer type inference** for simple local variables and primitive state
3. **Use explicit types** when initial value is null/undefined
4. **Import shared types** from service layer when available
5. **Create type aliases** for commonly reused complex types
6. **Document complex types** with JSDoc comments when non-obvious

### Benefits
- **Consistency**: All developers use same patterns
- **Maintainability**: Changes to shared types propagate automatically
- **IDE support**: Excellent autocomplete and error detection
- **Refactoring safety**: Type system catches breaking changes

### Success Criteria
- [ ] All components have explicit props interfaces
- [ ] All service functions have explicit return types
- [ ] Context API is fully typed with custom hook
- [ ] Event handlers use correct React event types
- [ ] No implicit `any` types in converted files

---

## Pattern 3: Pragmatic Type Escape Documentation

**Pattern Name**: Commented Type Escapes with Justification  
**Category**: Type Quality & Pragmatism Balance  
**Decision Source**: NFR Requirements Q2=C (Pragmatic escapes), Q3=A (Strict enforcement)

### Problem
Strict TypeScript mode catches many errors but can be overly restrictive for:
- Third-party libraries without type definitions
- Complex dynamic data structures (large JSON files)
- Legacy code patterns that are safe but hard to type
- Prototyping or migration-in-progress code

Blanket use of `any` defeats type safety. Zero tolerance slows development. Need balanced approach.

### Solution
Allow pragmatic use of `any` and type assertions with mandatory inline documentation explaining why.

#### Type Escape Categories

**Category 1: Third-Party Library Boundaries**
```typescript
// Using `any` for untyped external library - no @types package available
// TODO: Consider creating proper type declarations if usage expands
import externalLib from 'untyped-legacy-library';
const client: any = externalLib.createClient();
```

**Category 2: Large JSON Data Files**
```typescript
// Pragmatic `any` for large airport data file (300+ entries)
// Full typing would require 300+ interface properties with diminishing returns
import airportData from './AirportsData.json';
const airports: any = airportData;

// Alternative: Type just the access pattern
interface AirportDataEntry {
  code: string;
  name: string;
  [key: string]: any; // Allow other fields
}
const typedAirports = airportData as AirportDataEntry[];
```

**Category 3: Dynamic Property Access**
```typescript
// Using `any` for dynamic key access on API response
// Type guard would be verbose for this utility function
const getValue = (obj: any, key: string): any => {
  return obj[key];
};

// Better alternative when possible: use Record type
const getValueSafe = <T extends Record<string, any>>(
  obj: T,
  key: keyof T
): T[keyof T] => {
  return obj[key];
};
```

**Category 4: HTTP Proxy Middleware Config**
```typescript
// setupProxy.ts
// Using `any` for proxy middleware Express app type
// @types/http-proxy-middleware exists but Express app typing is complex
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app: any) {
  app.use('/api', createProxyMiddleware({
    target: 'http://backend:8080',
    changeOrigin: true,
  }));
};
```

**Category 5: Type Assertions for Known Values**
```typescript
// Safe assertion: we know this element exists in the DOM
const input = document.querySelector('#email-input') as HTMLInputElement;
input.value = 'test@example.com';

// Alternative: with null check
const inputSafe = document.querySelector('#email-input');
if (inputSafe instanceof HTMLInputElement) {
  inputSafe.value = 'test@example.com';
}
```

**Category 6: Testing Setup**
```typescript
// setupTests.ts
// Jest global additions use `any` for extensibility
import '@testing-library/jest-dom';

// Extend Jest matchers (using `any` for matcher type extensibility)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      // Add other custom matchers as: any
    }
  }
}
```

---

#### Type Escape Rules

**REQUIRED**:
- Inline comment MUST explain why type escape is used
- Comment should reference category (library boundary, dynamic access, etc.)
- Consider adding TODO if refinement is feasible later

**ALLOWED**:
- Explicit `any` type annotations
- Type assertions with `as Type`
- Non-null assertions `!` for known non-null values
- `@ts-expect-error` with explanatory comment

**DISCOURAGED**:
- `@ts-ignore` (prefer `@ts-expect-error` which fails if error is resolved)
- Overly broad `Record<string, any>` when more specific types are feasible
- `any` for core application logic (should be typed properly)

**FORBIDDEN**:
- Disabling strict mode flags in tsconfig.json
- Using `any` without inline justification
- Type escapes in core domain model files (Flight.ts, Context.tsx)

---

#### Preferred Alternatives to `any`

**Use `unknown` for truly unknown values**:
```typescript
// Better than `any` when type is genuinely unknown
const parseResponse = (data: unknown): Flight[] => {
  // Type guard to narrow `unknown` to expected shape
  if (Array.isArray(data) && data.every(isValidFlight)) {
    return data as Flight[];
  }
  throw new Error('Invalid flight data');
};

function isValidFlight(obj: any): obj is Flight {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.price === 'number'
  );
}
```

**Use generic constraints**:
```typescript
// Better than `any` for generic functions
const clone = <T extends object>(obj: T): T => {
  return { ...obj };
};
```

**Use union types for known variants**:
```typescript
// Better than `any` for limited set of types
type ApiResponse = SearchResponse | BookingResponse | ErrorResponse;

const handleResponse = (response: ApiResponse) => {
  // Type narrowing with discriminated unions
  if ('flights' in response) {
    // TypeScript knows this is SearchResponse
  }
};
```

---

### Implementation Guidelines

1. **Review existing code** for implicit `any` during conversion
2. **Add inline comments** for all explicit type escapes
3. **Prefer alternatives** (`unknown`, generics, unions) when feasible
4. **Group similar escapes** (e.g., all third-party lib boundaries in one file)
5. **Track type escapes** in code-generation-summary.md for future refinement

### Benefits
- **Pragmatic balance**: Strict mode benefits without development gridlock
- **Documentation**: Future developers understand why escapes were used
- **Refinement path**: TODO comments mark potential improvement areas
- **Visibility**: Explicit annotations make type escapes intentional and auditable

### Success Criteria
- [ ] All type escapes include inline justification
- [ ] No `@ts-ignore` usage (use `@ts-expect-error` instead)
- [ ] Core domain types (Flight, SearchParams) have zero type escapes
- [ ] Third-party boundaries clearly marked with comments

---

## Pattern 4: Comprehensive Manual Validation

**Pattern Name**: Critical Path Testing with Visual Verification  
**Category**: Runtime Stability & UI Preservation  
**Decision Source**: NFR Requirements Q7=A (Comprehensive validation)

### Problem
TypeScript conversion changes file extensions and adds type annotations but shouldn't change runtime behavior. Automated tests alone may not catch:
- Visual regressions (CSS, layout)
- Third-party UI component integration issues (Mantine)
- Browser-specific runtime errors
- OpenTelemetry tracing configuration
- Subtle state management bugs

Build success ≠ runtime success. Need comprehensive manual validation.

### Solution
Execute structured manual validation after each conversion phase, covering all critical user paths and visual verification points.

#### Validation Tier 1: Automated Checks (Required Every Phase)

```bash
# Type checking (must pass with strict mode)
npm run type-check

# Production build (must succeed)
npm run build

# Development server (must start without errors)
npm start

# Automated tests (if present, must pass)
npm test
```

**Success Criteria**:
- ✅ Zero type errors
- ✅ Zero build errors
- ✅ Dev server launches and serves application
- ✅ No console errors at startup

---

#### Validation Tier 2: Smoke Testing (Required Every Phase)

**Home Page Load**:
1. Navigate to `http://localhost:3000/`
2. Verify page renders without blank screen
3. Check browser console for errors (should be empty)
4. Verify OpenTelemetry spans are being created (check network tab for `/v1/traces` requests)
5. Verify header and navigation components display correctly

**Success Criteria**:
- ✅ Page renders completely
- ✅ No console errors
- ✅ OpenTelemetry initialized (traces sent)
- ✅ All UI elements visible

---

#### Validation Tier 3: Critical Path Testing (Required After Phase 3, 4, 5)

**Critical Path 1: Flight Search Flow**
1. From Home, navigate to Search page
2. Enter origin airport (e.g., "SEA") - verify autocomplete works
3. Enter destination airport (e.g., "NYC") - verify autocomplete works
4. Select departure date using Mantine DatePicker - verify calendar opens
5. Select return date using Mantine DatePicker (for round-trip)
6. Select seat class from dropdown (economy/business/etc.)
7. Select trip type (one-way vs round-trip)
8. Click "Search Flights" button
9. Verify loading state displays
10. Verify search results render correctly
11. Try search with no results - verify "No Flights Found" message displays

**Success Criteria**:
- ✅ All form inputs work correctly
- ✅ Mantine components (DatePicker, Select) function properly
- ✅ Search executes and results display
- ✅ Loading states appear appropriately
- ✅ Empty state handles gracefully

---

**Critical Path 2: Flight Selection & Cart**
1. From search results, select a flight
2. Verify flight details modal/card opens
3. Click "Add to Cart" button
4. Verify cart icon updates (shows item count)
5. Navigate to cart page
6. Verify flight details display correctly in cart
7. Verify price calculation is correct
8. Click remove button on cart item
9. Verify item removed from cart
10. Verify empty cart state displays correctly

**Success Criteria**:
- ✅ Flight selection works
- ✅ Cart updates reflect additions/removals
- ✅ Price calculations accurate
- ✅ Empty cart state functions

---

**Critical Path 3: Checkout Flow**
1. With items in cart, navigate to checkout
2. Verify flight details summary displays
3. Verify passenger count and price breakdown
4. Verify cost breakdown component shows itemized costs
5. Verify confirmation UI renders correctly
6. Check all interactive elements (buttons, forms)

**Success Criteria**:
- ✅ Checkout page renders completely
- ✅ All flight details accurate
- ✅ Price breakdown matches cart
- ✅ All UI components functioning

---

#### Validation Tier 4: Visual Regression Verification (Required After Phase 3, 4, 5)

**Component Visual Checks**:
- **Mantine DatePicker**: Calendar popup displays correctly, dates selectable
- **Mantine Select**: Dropdown opens, options selectable, styling preserved
- **Mantine Button**: All button variants render correctly (primary, secondary, etc.)
- **Icons (react-icons)**: All icons render correctly, no missing icons
- **TripCard component**: Flight cards display with correct layout and styling
- **Cart component**: Cart layout preserved, responsive on mobile
- **Search form**: Form layout responsive, inputs aligned correctly

**Layout & Responsiveness**:
- Test on desktop viewport (1920x1080)
- Test on tablet viewport (768x1024)
- Test on mobile viewport (375x667)
- Verify all pages remain responsive
- Check navigation menu works on mobile

**Success Criteria**:
- ✅ All Mantine components render correctly
- ✅ Icons display properly
- ✅ Layout responsive across viewports
- ✅ No CSS/styling regressions
- ✅ Colors, fonts, spacing preserved

---

#### Validation Tier 5: Runtime Stability Verification (Required Final Phase)

**Browser Console Checks**:
- Open Chrome DevTools console
- Perform all critical path actions
- Verify zero errors in console
- Verify zero React warnings
- Check for any deprecation warnings

**Network Tab Checks**:
- Verify API calls execute correctly
- Check OpenTelemetry traces are sent to collector
- Verify proxy configuration works (`/api/...` routes)

**Environment Variables**:
- If using environment variables, verify they're accessible
- Check Docker env substitution still works (if applicable)

**Success Criteria**:
- ✅ Zero console errors during full flow
- ✅ Zero React warnings
- ✅ API calls successful
- ✅ OpenTelemetry tracing functional
- ✅ proxy configuration working

---

### Validation Checklist Template

Create file: `aidlc-docs/construction/unit-2/validation-results.md`

```markdown
# Unit 2 Validation Results

## Phase 1: Services
- [ ] Automated checks passed
- [ ] Smoke test passed
- Date: _____
- Validator: _____

## Phase 2: Infrastructure
- [ ] Automated checks passed
- [ ] Smoke test passed
- Date: _____
- Validator: _____

## Phase 3: Components
- [ ] Automated checks passed
- [ ] Smoke test passed
- [ ] Critical Path 1: Flight Search - PASSED / FAILED
- [ ] Critical Path 2: Cart & Selection - PASSED / FAILED
- [ ] Visual regression checks - PASSED / FAILED
- Date: _____
- Validator: _____

## Phase 4: Pages
- [ ] Automated checks passed
- [ ] Smoke test passed
- [ ] Critical Path 1: Flight Search - PASSED / FAILED
- [ ] Critical Path 2: Cart & Selection - PASSED / FAILED
- [ ] Critical Path 3: Checkout - PASSED / FAILED
- [ ] Visual regression checks - PASSED / FAILED
- Date: _____
- Validator: _____

## Phase 5: App Root (Final)
- [ ] Automated checks passed
- [ ] Smoke test passed
- [ ] ALL critical paths - PASSED / FAILED
- [ ] Visual regression checks - PASSED / FAILED
- [ ] Runtime stability checks - PASSED / FAILED
- Date: _____
- Validator: _____

## Issues Found
| Issue | Phase | Severity | Status | Resolution |
|-------|-------|----------|--------|------------|
| | | | | |
```

---

### Implementation Guidelines

1. **Execute validation immediately** after each phase conversion
2. **Document findings** in validation-results.md
3. **Block progression** if critical issues found
4. **Take screenshots** of visual elements for comparison
5. **Record console output** if errors occur

### Benefits
- **UI preservation guarantee**: Visual checks catch regressions
- **Confidence**: Comprehensive testing validates no behavior changes
- **Issue isolation**: Per-phase validation identifies exactly when issues introduced
- **Documentation**: Validation record proves due diligence

### Success Criteria
- [ ] Validation checklist completed for all 5 phases
- [ ] All critical paths tested and passed
- [ ] Zero visual regressions detected
- [ ] Zero runtime errors in console
- [ ] validation-results.md documents full validation history

---

## Pattern 5: Third-Party Type Wrapper Strategy

**Pattern Name**: Minimal Declaration Files for Untyped Libraries  
**Category**: Third-Party Integration & Type Safety  
**Decision Source**: NFR Requirements Q5=C (Broad `any` wrappers)

### Problem
Some third-party libraries lack TypeScript definitions. Options:
- Install @types packages (not always available)
- Create comprehensive type definitions (time-consuming, brittle)
- Use `any` everywhere (loses type safety)

Need minimal effort solution that unblocks conversion without excessive type engineering.

### Solution
Create minimal `*.d.ts` declaration files for untyped libraries using broad `any` types, documented as temporary.

#### Implementation Structure

Create directory: `src/types/` for local type declarations

```
src/
  types/
    http-proxy-middleware.d.ts  (if needed)
    legacy-libraries.d.ts       (if needed)
```

---

#### Example: HTTP Proxy Middleware (if @types not sufficient)

**File**: `src/types/http-proxy-middleware.d.ts`

```typescript
// Temporary minimal types for http-proxy-middleware
// Using broad `any` types to unblock TypeScript conversion
// TODO: Replace with @types/http-proxy-middleware if issues persist

declare module 'http-proxy-middleware' {
  // Broad type for middleware function
  export function createProxyMiddleware(config: any): any;
  
  // Allow any additional exports
  export const [key: string]: any;
}
```

---

#### Example: Untyped Utility Library

**File**: `src/types/legacy-libraries.d.ts`

```typescript
// Temporary types for libraries without TypeScript support
// Using pragmatic `any` wrappers per NFR Design Pattern 5

declare module 'some-untyped-library' {
  const lib: any;
  export default lib;
  
  // If specific exports are known:
  export function utilityFunction(param: any): any;
  export interface KnownType {
    [key: string]: any;
  }
}

declare module 'another-legacy-lib' {
  export = AnotherLib;
  
  class AnotherLib {
    constructor(config: any);
    doSomething(arg: any): any;
  }
}
```

---

#### Validation: Verify Types Work

```typescript
// In src/setupProxy.ts, verify import resolves:
import { createProxyMiddleware } from 'http-proxy-middleware';

// TypeScript should not error on this import after declaration file created
```

---

### Implementation Guidelines

1. **Check @types first**: Run `npm search @types/<library-name>`
2. **Install @types if available**: Prefer official types over custom declarations
3. **Create minimal declarations** only if @types don't exist or are insufficient
4. **Document as temporary**: Add TODO comments for future refinement
5. **Keep declarations broad**: Use `any` liberally; don't over-engineer types
6. **Group related libraries**: One declaration file can cover multiple libraries

### When This Pattern Applies

**Apply this pattern for**:
- Libraries without @types packages
- Legacy CRA-specific libraries (setupProxy patterns)
- Complex Express middleware typing (if needed)
- Build configuration libraries

**Don't use this pattern for**:
- React (has excellent types)
- Mantine (TypeScript native)
- React Router (TypeScript native)
- OpenTelemetry (has types)
- Core application code (type properly)

---

### Benefits
- **Unblocks conversion**: No waiting for community types
- **Minimal effort**: Broad `any` types are quick to write
- **Iterative refinement**: Can improve types later if value justifies
- **Clear intent**: TODO comments mark temporary nature

### Success Criteria
- [ ] All third-party imports resolve without TypeScript errors
- [ ] Declaration files documented as temporary
- [ ] @types packages used where available
- [ ] Application code (not libraries) properly typed

---

## Pattern 6: Performance Monitoring & Optimization

**Pattern Name**: Continuous Type-Check Performance Tracking  
**Category**: Developer Experience & Build Performance  
**Decision Source**: NFR Requirements Q6=A (Aggressive performance targets)

### Problem
TypeScript type-checking can slow down as codebase grows. Performance targets:
- Incremental type-check: < 5 seconds
- Full type-check: < 30 seconds

Without monitoring, performance can degrade silently, reducing developer productivity.

### Solution
Track type-check times after each conversion phase and optimize if targets are missed.

#### Baseline Measurement (After Phase 1)

```bash
# Measure full type-check time
time npm run type-check

# Expected: < 30 seconds for full project
# Record baseline in code-generation-summary.md
```

#### Incremental Measurement (During Development)

```bash
# Start watch mode
npm run type-check:watch

# Make small change to file
# Measure time from file save to error feedback

# Expected: < 5 seconds for single-file change
```

---

#### Performance Tracking Table

Create in `code-generation-summary.md`:

```markdown
## Type-Check Performance Tracking

| Phase | Files Converted | Full Check Time | Incremental Check Time | Status |
|-------|-----------------|-----------------|------------------------|--------|
| 1     | 5               | 8s              | 2s                     | ✅ Within target |
| 2     | 10              | 12s             | 3s                     | ✅ Within target |
| 3     | 27              | 22s             | 4s                     | ✅ Within target |
| 4     | 30              | 25s             | 5s                     | ✅ Within target |
| 5     | 31              | 28s             | 5s                     | ✅ Within target |

**Targets**: Full < 30s, Incremental < 5s
```

---

#### Optimization Strategies (If Targets Missed)

**Strategy 1: Verify skipLibCheck is Enabled**
```json
// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true  // Skip checking declaration files in node_modules
  }
}
```

**Strategy 2: Enable Incremental Compilation**
```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./build/.tsbuildinfo"
  }
}
```

**Strategy 3: Exclude Unnecessary Directories**
```json
// tsconfig.json
{
  "exclude": [
    "node_modules",
    "build",
    "dist",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

**Strategy 4: Use TypeScript Project References** (if codebase is very large)
```json
// Only if needed for very large codebases (100+ files)
// Split into subprojects with references
```

**Strategy 5: Optimize Complex Types**
- Avoid deeply nested conditional types
- Use type aliases to simplify complex unions
- Avoid circular type dependencies

---

### Implementation Guidelines

1. **Measure after each phase**: Record type-check times in tracking table
2. **Investigate if target missed**: Don't ignore performance degradation
3. **Optimize before proceeding**: Fix performance issues before next phase
4. **Re-measure after optimization**: Verify optimization worked

### Benefits
- **Proactive monitoring**: Catch performance issues early
- **Developer productivity**: Fast feedback loop maintained
- **Incremental optimization**: Fix issues as they arise, not at the end

### Success Criteria
- [ ] Type-check performance tracked after each phase
- [ ] Full type-check completes in < 30 seconds
- [ ] Incremental type-check completes in < 5 seconds
- [ ] Tracking table included in code-generation-summary.md

---

## Pattern 7: Git Checkpoint Strategy

**Pattern Name**: Per-Phase Atomic Commits with Clear Messages  
**Category**: Risk Management & Rollback Safety  
**Decision Source**: NFR Requirements Q1=B (Layered approach with incremental validation)

### Problem
Converting 29+ files in one commit creates:
- Risky monolithic changes
- Difficult rollback if issues found
- Unclear history if debugging later
- Hard to identify when specific issues were introduced

Need granular Git history that enables safe rollback and clear audit trail.

### Solution
Commit after each conversion phase with descriptive messages and quality gate validation.

#### Commit Strategy

**Before Starting Unit 2**:
```bash
# Ensure clean working directory
git status

# Create feature branch (optional)
git checkout -b feature/unit-2-typescript-conversion
```

---

**Phase 1 Commit**:
```bash
# After Phase 1 conversion completed and validated
git add src/services/*.ts src/services/*.tsx
git add aidlc-docs/construction/unit-2/
git commit -m "Unit 2 Phase 1: Convert services to TypeScript

- Convert Functions.js → Functions.ts (already done in Unit 1)
- Convert Context.js → Context.tsx (React Context with types)
- Convert Flight.js → Flight.ts (API service with interfaces)
- Convert Tracing.js → Tracing.ts (OpenTelemetry types)
- Convert CustomTracing.js → CustomTracing.ts

Quality gates passed:
✅ npm run type-check (8s)
✅ npm run build
✅ Smoke test: Home page loads
✅ No console errors

Establishes patterns for API types, Context typing, and service layers."
```

---

**Phase 2 Commit**:
```bash
git add src/index.tsx src/reportWebVitals.ts src/setupProxy.ts src/setupTests.ts src/App.test.tsx
git add aidlc-docs/construction/unit-2/
git commit -m "Unit 2 Phase 2: Convert infrastructure to TypeScript

- Convert index.js → index.tsx (React entry point)
- Convert reportWebVitals.js → reportWebVitals.ts
- Convert setupProxy.js → setupProxy.ts (Express middleware types)
- Convert setupTests.js → setupTests.ts (Jest setup)
- Convert App.test.js → App.test.tsx

Quality gates passed:
✅ npm run type-check (12s)
✅ npm run build
✅ npm start (dev server launches)
✅ Smoke test: App renders correctly
✅ No console errors

Infrastructure layer now fully typed."
```

---

**Phase 3 Commits** (one per batch or combined):
```bash
# Batch 3A
git add src/components/ApplicationContainer/*.tsx
git commit -m "Unit 2 Phase 3A: Convert ApplicationContainer components
- ApplicationContainer.js → .tsx
- ApplicationHeader.js → .tsx
Quality gates: type-check passed, visual verification OK"

# Batch 3B-E (can be combined if desired)
git add src/components/**/*.tsx
git commit -m "Unit 2 Phase 3: Convert all shared components to TypeScript

Components converted (17 files):
- Authentication: Username
- Search: Search, AirportInformation
- TripCard: TripCard, FlightDetails
- Flight: Flight
- Cart: Cart, EmptyCart, FlightDetails
- Breakdown: Confirmation, Cost
- SearchResults: SearchResults, Results, NoResults

Quality gates passed:
✅ npm run type-check (22s)
✅ npm run build
✅ Critical Path 1: Flight search flow validated
✅ Critical Path 2: Cart functionality validated
✅ Visual regression checks passed
✅ Mantine components working correctly

All shared components now typed with explicit props interfaces."
```

---

**Phase 4 Commit**:
```bash
git add src/pages/**/*.tsx
git commit -m "Unit 2 Phase 4: Convert page components to TypeScript

- Home/Home.js → Home.tsx
- SearchFlight/SearchFlight.js → SearchFlight.tsx
- Checkout/Checkout.js → Checkout.tsx

Quality gates passed:
✅ npm run type-check (25s)
✅ npm run build
✅ All critical paths validated end-to-end
✅ Visual checks passed
✅ No runtime errors

All page-level routes now TypeScript."
```

---

**Phase 5 Commit**:
```bash
git add src/App.tsx
git add aidlc-docs/construction/unit-2/
git commit -m "Unit 2 Phase 5: Convert App root to TypeScript - COMPLETE

- App.js → App.tsx (application root)

Quality gates passed:
✅ npm run type-check (28s full, 5s incremental)
✅ npm run build
✅ Comprehensive validation: ALL features tested
✅ Visual regression: ZERO issues found
✅ Runtime stability: ZERO console errors
✅ OpenTelemetry tracing functional

🎉 Unit 2 TypeScript conversion complete: 29+ files migrated.
All files compile with strict TypeScript mode.
UI/UX preserved with zero behavior changes.
Performance targets met (< 5s incremental, < 30s full type-check)."
```

---

#### Rollback Procedure

**If Phase Fails Quality Gates**:
```bash
# View recent commits
git log --oneline -5

# Identify last passing phase commit
# Rollback to that commit
git reset --hard <commit-hash>

# Or soft reset to keep changes for debugging
git reset --soft <commit-hash>

# Fix issues, then re-run phase and commit again
```

---

### Commit Message Template

```
Unit 2 Phase N: [Phase Name]

- File conversion 1
- File conversion 2
- ...

Quality gates passed:
✅ npm run type-check ([time])
✅ npm run build
✅ [Additional validations specific to phase]
✅ [Visual/manual checks]

[Brief summary of patterns established or issues resolved]
```

---

### Implementation Guidelines

1. **Commit only after quality gates pass**: Never commit failing code
2. **Use descriptive messages**: Future developers need context
3. **Include validation summary**: Document what was tested
4. **Keep commits atomic**: One phase per commit (or batches within phase)
5. **Update plan checkboxes before committing**: Keep plan in sync

### Benefits
- **Safe rollback**: Can revert to any previous phase if needed
- **Clear audit trail**: Git history shows exactly what changed when
- **Debugging aid**: Can bisect to find when issues introduced
- **Progress tracking**: Commits show clear project progress

### Success Criteria
- [ ] 5 phase commits created (or more if batched)
- [ ] Each commit includes quality gate summary
- [ ] Commit messages describe what was converted
- [ ] Final commit marks Unit 2 complete
- [ ] Clean Git history enables easy rollback if needed

---

## Summary

These 7 design patterns ensure Unit 2's TypeScript conversion is:
- **Safe**: Layered approach with validation gates (Pattern 1, 4, 7)
- **High Quality**: Strict typing with pragmatic escapes (Pattern 2, 3)
- **Performant**: Continuous monitoring and optimization (Pattern 6)
- **Pragmatic**: Unblocking third-party integration (Pattern 5)
- **Maintainable**: Clear patterns and Git history

All patterns derived from NFR requirements answers and work together to achieve successful migration with zero behavior changes.

**Total Patterns**: 7  
**Document Version**: 1.0  
**Created**: 2026-03-09
