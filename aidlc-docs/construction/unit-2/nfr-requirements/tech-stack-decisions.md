# Tech Stack Decisions - Unit 2: TypeScript Conversion

**Unit**: Unit 2 - TypeScript Conversion  
**Phase**: CONSTRUCTION  
**Stage**: NFR Requirements  
**Date Generated**: 2026-03-09  

---

## Executive Summary

This document defines concrete technical decisions for converting 29+ JavaScript files to TypeScript. These decisions establish file naming standards, type modeling patterns, conversion sequencing, and quality gates for Unit 2 execution.

---

## Decision Framework

| Dimension | Decision | Reasoning |
|-----------|----------|-----------|
| Conversion Strategy | Layered (Answer Q1=B) | Services/types first, then components, then pages |
| Type Escape Policy | Pragmatic (Answer Q2=C) | Allow `any` where needed with inline comments |
| Strict Enforcement | Full strict gate (Answer Q3=A) | All converted files must pass strict checks |
| Definition of Done | Type-clean only (Answer Q4=C) | Compiled with strict checks; tests preserved |
| Third-Party Types | Broad `any` wrappers (Answer Q5=C) | Unblock conversion over perfect external types |
| Performance Target | Aggressive (Answer Q6=A) | type-check < 5s incremental, < 30s full |
| Validation Depth | Comprehensive (Answer Q7=A) | Critical paths + visual verification |
| Documentation | Minimal (Answer Q8=C) | Inline comments and short summary only |

---

## File Naming & Extension Conventions

### Extension Mapping Rules

| Current Extension | Contains JSX? | Target Extension | Reason |
|-------------------|---------------|------------------|---------|
| `.js` | No | `.ts` | Pure TypeScript (utilities, services) |
| `.js` | Yes | `.tsx` | TypeScript + JSX (React components) |

### Specific File Conversions

**Services (No JSX)** → `.ts`:
- `src/services/Functions.js` → ✅ `Functions.ts` (completed in Unit 1)
- `src/services/Context.js` → `Context.tsx` (has JSX: Context.Provider)
- `src/services/Flight.js` → `Flight.ts`
- `src/services/Tracing.js` → `Tracing.ts`
- `src/services/CustomTracing.js` → `CustomTracing.ts`

**Root Infrastructure**:
- `src/index.js` → `index.tsx` (renders JSX)
- `src/App.js` → `App.tsx` (React component)
- `src/reportWebVitals.js` → `reportWebVitals.ts` (no JSX)
- `src/setupProxy.js` → `setupProxy.ts` (no JSX)
- `src/setupTests.js` → `setupTests.ts` (no JSX)

**All Components** → `.tsx`:
- All files in `src/components/**/*.js` → `**/*.tsx`
- All files in `src/pages/**/*.js` → `**/*.tsx`

**Test Files**:
- `src/App.test.js` → `App.test.tsx`
- All other `*.test.js` → `*.test.tsx` (if JSX present) or `*.test.ts`

---

## TypeScript Conversion Phases

### Phase 1: Shared Services & Utilities (Foundation Layer)

**Files to Convert** (5 files):
1. ✅ `src/services/Functions.js` → `Functions.ts` (completed in Unit 1)
2. `src/services/Context.js` → `Context.tsx`
3. `src/services/Flight.js` → `Flight.ts`
4. `src/services/Tracing.js` → `Tracing.ts`
5. `src/services/CustomTracing.js` → `CustomTracing.ts`

**Type Patterns**:
- Export explicit interfaces for API response shapes
- Type all function signatures
- Create type aliases for complex types (e.g., `FlightData`, `SearchParams`)

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ No new console errors

---

### Phase 2: Root Infrastructure (Entry Points)

**Files to Convert** (5 files):
1. `src/index.js` → `index.tsx`
2. `src/reportWebVitals.js` → `reportWebVitals.ts`
3. `src/setupProxy.js` → `setupProxy.ts`
4. `src/setupTests.js` → `setupTests.ts`
5. `src/App.test.js` → `App.test.tsx`

**Type Patterns**:
- Type React.render() parameters
- Type web-vitals callback signatures
- Type http-proxy-middleware configuration
- Type Jest/testing-library setup

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Application starts without errors (`npm start`)

---

### Phase 3: Shared Components (Dependency Layer)

**Files to Convert** (~17 files in components/):

**Batch 3A - Application Container** (2 files):
- `src/components/ApplicationContainer/ApplicationContainer.js` → `.tsx`
- `src/components/ApplicationContainer/ApplicationHeader.js` → `.tsx`

**Batch 3B - Authentication** (1 file):
- `src/components/Authentication/Username.js` → `.tsx`

**Batch 3C - Search Components** (3 files):
- `src/components/Search/Search.js` → `.tsx`
- `src/components/Search/AirportInformation.js` → `.tsx`
- Keep JSON data files as-is (AirportsData.json, SeatData.json, TripData.json)

**Batch 3D - Display Components** (8 files):
- `src/components/TripCard/TripCard.js` → `.tsx`
- `src/components/TripCard/FlightDetails.js` → `.tsx`
- `src/components/Flight/Flight.js` → `.tsx`
- `src/components/Cart/Cart.js` → `.tsx`
- `src/components/Cart/EmptyCart.js` → `.tsx`
- `src/components/Cart/FlightDetails.js` → `.tsx`
- `src/components/Breakdown/Confirmation.js` → `.tsx`
- `src/components/Breakdown/Cost.js` → `.tsx`

**Batch 3E - Search Results** (3 files):
- `src/components/SearchResults/SearchResults.js` → `.tsx`
- `src/components/SearchResults/Results.js` → `.tsx`
- `src/components/SearchResults/NoResults.js` → `.tsx`

**Type Patterns for Components**:
```typescript
// Standard component signature
interface ComponentNameProps {
  propName: PropType;
  // ... other props
}

export const ComponentName: React.FC<ComponentNameProps> = ({ propName }) => {
  return <div>{propName}</div>;
};
```

**Quality Gate Per Batch**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Visual verification of affected components

---

### Phase 4: Page Components (Top-Level Routes)

**Files to Convert** (3 files):
1. `src/pages/Home/Home.js` → `Home.tsx`
2. `src/pages/SearchFlight/SearchFlight.js` → `SearchFlight.tsx`
3. `src/pages/Checkout/Checkout.js` → `Checkout.tsx`

**Type Patterns**:
- Type route params if using React Router
- Type page-level state management
- Type navigation hooks

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds
- ✅ Full routing flow validation (manual test)

---

### Phase 5: Application Root

**Files to Convert** (1 file):
1. `src/App.js` → `App.tsx`

**Quality Gate**:
- ✅ `npm run type-check` passes
- ✅ `npm run build` succeeds  
- ✅ Full application smoke test (all critical paths)

---

## Type Modeling Standards

### Component Props

**Standard Pattern**:
```typescript
interface MyComponentProps {
  /** Required string prop */
  title: string;
  
  /** Optional number prop */
  count?: number;
  
  /** Callback prop */
  onAction: (id: string) => void;
  
  /** Complex object prop */
  data: {
    id: string;
    name: string;
  };
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0, onAction, data }) => {
  // implementation
};
```

### State Management Types

**React useState**:
```typescript
// Inferred type (preferred when obvious)
const [count, setCount] = useState(0); // number inferred

// Explicit type (when initial value is null/undefined)
const [user, setUser] = useState<User | null>(null);

// Complex state
interface FormState {
  email: string;
  password: string;
  errors: string[];
}
const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  errors: []
});
```

**React Context** (Context.tsx):
```typescript
interface AppContextValue {
  flights: Flight[];
  selectedFlight: Flight | null;
  addFlight: (flight: Flight) => void;
  // ... other context values
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

### Event Handler Types

**Common React Event Types**:
```typescript
// Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };

// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { };

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { };

// Type alias for reuse (if same handler used multiple times)
type InputChangeHandler = React.ChangeEvent<HTMLInputElement>;
```

### API Response Types

**Flight Service Types** (Flight.ts):
```typescript
export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface FlightSegment {
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO 8601
  arrivalTime: string;   // ISO 8601
  duration: number;      // minutes
  flightNumber: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  price: number;
  seatClass: 'economy' | 'premium' | 'business' | 'first';
  available: boolean;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  seatClass: string;
}

// API response wrappers
export interface SearchResponse {
  flights: Flight[];
  total: number;
}
```

---

## Type Escape Guidelines

### When to Use `any`

**Acceptable Cases** (Answer Q2=C: Pragmatic):
1. **Third-party library boundaries without types**:
   ```typescript
   // External library with no types - temporary wrapper
   const externalLib: any = require('untyped-library');
   ```

2. **Complex JSON data files**:
   ```typescript
   // Large JSON file with complex nested structure
   import airportData from './AirportsData.json';
   const airports: any = airportData; // Pragmatic for large data
   ```

3. **Dynamic property access**:
   ```typescript
   // Dynamic keys from external source
   const getValue = (obj: any, key: string) => obj[key];
   ```

### Required Documentation for Type Escapes

Every `any` type must include inline comment:
```typescript
// Using `any` here because: [brief reason]
const value: any = ...;
```

### Preferred Alternatives to `any`

1. Use `unknown` when type is truly unknown:
   ```typescript
   const parseResponse = (data: unknown): Flight[] => {
     // Type guard to narrow `unknown` to expected shape
     if (isFlightArray(data)) {
       return data;
     }
     throw new Error('Invalid response');
   };
   ```

2. Use generic constraints:
   ```typescript
   const clone = <T extends object>(obj: T): T => ({ ...obj });
   ```

3. Use type assertions when you know the type:
   ```typescript
   const input = document.querySelector('input') as HTMLInputElement;
   ```

---

## Third-Party Library Type Strategy

### Libraries Already Typed (No Action Needed)

| Library | Type Source | Notes |
|---------|-------------|-------|
| react | @types/react | Installed in Unit 1 |
| react-dom | @types/react-dom | Installed in Unit 1 |
| @mantine/core | Built-in | TypeScript native |
| @mantine/hooks | Built-in | TypeScript native |
| @mantine/dates | Built-in | TypeScript native |
| react-router-dom | Built-in | TypeScript native (v6+) |
| react-icons | Built-in | TypeScript native |
| @opentelemetry/* | Built-in | All packages include types |

### Libraries Requiring Type Handling

**http-proxy-middleware**:
- Check if @types/http-proxy-middleware exists
- If not, use broad type for middleware config:
  ```typescript
  // setupProxy.ts
  const { createProxyMiddleware } = require('http-proxy-middleware');
  
  module.exports = function(app: any) {
    app.use('/api', createProxyMiddleware({ /* config */ }));
  };
  ```

**web-vitals**:
- Likely has built-in types, verify during Phase 2
- If not:
  ```typescript
  // reportWebVitals.ts
  type ReportHandler = (metric: any) => void;
  ```

### Strategy for Missing Types (Answer Q5=C)

Create minimal `src/types/` directory for local declarations:

```
src/types/
  http-proxy-middleware.d.ts  (if needed)
  legacy-libraries.d.ts       (if needed)
```

Example declaration file:
```typescript
// src/types/http-proxy-middleware.d.ts
// Temporary broad types for CRA proxy setup - using `any` pragmatically
declare module 'http-proxy-middleware' {
  export function createProxyMiddleware(config: any): any;
}
```

---

## Performance Optimization

### Target Performance (Answer Q6=A: Aggressive)

- **Incremental type-check**: < 5 seconds
- **Full type-check**: < 30 seconds

### Optimization Techniques

1. **Incremental Compilation** (already in tsconfig.json from Unit 1):
   ```json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": "./build/.tsbuildinfo"
     }
   }
   ```

2. **Skip Library Checks** (already enabled):
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

3. **Parallel Type Checking** (if needed):
   - Use `ts-node` with `--transpile-only` for fast feedback
   - Defer full type-check to CI/CD pipeline for complex cases

4. **IDE Optimization**:
   - VS Code: Use TypeScript 5.9.3 (installed in Unit 1)
   - Enable `typescript.tsserver.useSyntaxServer` for faster feedback

### Performance Monitoring

Check type-check performance after each phase:
```bash
# Measure full type-check time
time npm run type-check

# Target: < 30 seconds for ~29 files
```

If performance degrades beyond target, investigate:
- Complex type inference chains
- Circular dependencies
- Deep nested generic types

---

## Validation & Quality Gates

### Per-Phase Quality Gates (Answer Q7=A: Comprehensive)

**Automated Checks** (Must Pass):
- ✅ `npm run type-check` completes successfully
- ✅ `npm run build` produces clean build
- ✅ Type-check time within performance targets (< 5s incremental, < 30s full)

**Manual Validation** (Critical Paths):
1. **After Phase 1 (Services)**: Verify utility functions still work correctly
2. **After Phase 2 (Infrastructure)**: Verify app starts without errors
3. **After Phase 3 (Components)**: Validate affected UI components:
   - Search component renders and functions
   - Cart displays correctly
   - Flight cards display properly
4. **After Phase 4 (Pages)**: Validate full user flows:
   - Home → Search → Results → Cart → Checkout
5. **After Phase 5 (App Root)**: Full smoke test all features

**Visual Verification Points**:
- Mantine DatePicker still renders correctly
- Search autocomplete works
- Flight cards display with icons
- Responsive layout preserved
- No CSS/styling regressions

---

## Rollback Strategy

### Git Commit Strategy

Commit after each phase completion:
```bash
git add .
git commit -m "Unit 2 Phase 1: Convert services to TypeScript"
git commit -m "Unit 2 Phase 2: Convert infrastructure to TypeScript"
git commit -m "Unit 2 Phase 3A: Convert ApplicationContainer to TypeScript"
# ... etc
```

### Rollback Procedure

If any phase fails quality gates or introduces regressions:
1. Identify last passing commit (previous phase)
2. Rollback changes: `git reset --hard <commit-hash>`
3. Re-analyze failed phase for issues
4. Apply fixes and retry

---

## Documentation Deliverables (Answer Q8=C: Minimal)

### Required Documents

1. **This Document**: `tech-stack-decisions.md` ✅
2. **Code Generation Summary**: `code-generation-summary.md` (created during execution)
   - Conversion approach summary
   - Key type modeling decisions
   - Notable challenges and solutions
   - Validation results

### Inline Comments Requirements

Add comments for:
- Type escapes (`any` usage)
- Complex type definitions
- Non-obvious type assertions
- Workarounds for TypeScript limitations

### NOT Required

- ❌ Comprehensive TypeScript migration guide
- ❌ Best practices documentation
- ❌ Team training materials
- ❌ Detailed troubleshooting guide

---

**Document Version**: 1.0  
**Created**: 2026-03-09  
**Answer Summary**: 1B, 2C, 3A, 4C, 5C, 6A, 7A, 8C  
**Total Files to Convert**: 29+ files across 5 phases
