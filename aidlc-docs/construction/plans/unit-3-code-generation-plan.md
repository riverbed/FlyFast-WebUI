# Unit 3: Mantine v7 Migration - Code Generation Plan

## Purpose
Migrate all Mantine UI components from v6 to v7 APIs across the TypeScript codebase while preserving visual and functional behavior.

## Unit Context
- **Unit**: Unit 3 - Mantine v7 Migration
- **Dependencies**: Unit 1 (deps updated) and Unit 2 (TypeScript conversion) complete
- **Primary Scope**: Update @mantine/core, @mantine/dates, @mantine/hooks usages
- **Out of Scope**: New features, refactors unrelated to Mantine v7 migration

## Story Traceability
- **Story U3-S1**: Replace all Mantine v6 component APIs with v7 equivalents
- **Story U3-S2**: Preserve visual parity (allow accessibility improvements)
- **Story U3-S3**: Maintain strict TypeScript compliance during migration

## Files and Areas Likely Impacted
- `src/services/Context.tsx` (useLocalStorage)
- `src/components/ApplicationContainer/ApplicationContainer.tsx`
- `src/components/ApplicationContainer/ApplicationHeader.tsx`
- `src/components/Search/Search.tsx`
- `src/components/SearchResults/SearchResults.tsx`
- `src/components/SearchResults/Results.tsx`
- `src/components/SearchResults/NoResults.tsx`
- `src/components/TripCard/TripCard.tsx`
- `src/components/TripCard/FlightDetails.tsx`
- `src/components/Cart/Cart.tsx`
- `src/components/Cart/EmptyCart.tsx`
- `src/components/Cart/FlightDetails.tsx`
- `src/components/Breakdown/Cost.tsx`
- `src/components/Breakdown/Confirmation.tsx`
- `src/pages/Home/Home.tsx`
- `src/pages/SearchFlight/SearchFlight.tsx`
- `src/pages/Checkout/Checkout.tsx`
- `src/App.tsx`

---

## Code Generation Steps

### Step 1: Baseline Verification
- [x] Confirm @mantine/core, @mantine/dates, @mantine/hooks are at v7.x in package.json
- [x] Scan codebase for all @mantine imports and record affected files

### Step 2: Hooks Migration
- [x] Update `useLocalStorage` usage in `src/services/Context.tsx`
- [x] Update `useLocalStorage` usage in `src/components/ApplicationContainer/ApplicationContainer.tsx`
- [x] Adjust typing to match v7 hook signatures

### Step 3: Layout and Shared Components
- [x] Update Mantine layout components (Grid, Group, Paper, AppShell, Header, etc.)
- [x] Update Application shell and header components for v7 API changes
- [x] Ensure theme and color scheme handling matches v7 patterns

### Step 4: Form and Input Components
- [x] Update Search form components (Autocomplete, Select/NativeSelect, TextInput, Button)
- [x] Update DatePickerInput usage for v7 API compatibility
- [x] Verify form layout and spacing remain consistent

### Step 5: Complex Feature Components
- [x] Update Mantine usage in SearchResults components
- [x] Update Mantine usage in TripCard and FlightDetails
- [x] Update Mantine usage in Cart, EmptyCart, and Cart FlightDetails
- [x] Update Mantine usage in Breakdown components (Cost, Confirmation)

### Step 6: Page and App Integration
- [x] Update Mantine usage in pages (Home, SearchFlight, Checkout)
- [x] Update App-level loading and layout components (LoadingOverlay, etc.)
- [x] Ensure routing and lazy-loading continue to function

### Step 7: Cleanup and Validation
- [x] Remove or replace any deprecated v6 props or APIs
- [x] Ensure no v6 Mantine imports remain
- [x] Run `npm run type-check` and resolve any v7 type errors

### Step 8: Documentation Summary
- [x] Create `aidlc-docs/construction/unit-3/code/code-generation-summary.md` summarizing changes

---

## Dependencies and Constraints
- **No new features**: Only v7 migration updates
- **Strict TypeScript**: No loosening of `tsconfig.json` rules
- **Visual parity**: Manual screenshot comparison required post-migration
- **Forward-only migration**: Fix issues in place

---

## Plan Checklist
- [x] Code generation plan approved
- [x] Step 1 completed
- [x] Step 2 completed
- [x] Step 3 completed
- [x] Step 4 completed
- [x] Step 5 completed
- [x] Step 6 completed
- [x] Step 7 completed
- [x] Step 8 completed
- [x] Code generation approved by user
