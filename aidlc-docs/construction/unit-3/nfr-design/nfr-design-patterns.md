# Unit 3: Mantine v7 Migration - NFR Design Patterns

## Overview
Design patterns applied to satisfy Unit 3 NFR requirements during Mantine v7 migration.

---

## Pattern 1: Component-by-Component Migration Sequencing
- **Intent**: Reduce risk by updating Mantine hooks first, then layout, then complex components.
- **Application**:
  - Phase 1: Hooks (`useLocalStorage`) and shared UI primitives
  - Phase 2: Layout components (Grid, Group, Paper)
  - Phase 3: Complex components (Search, Cart, TripCard, Checkout)
- **NFR Alignment**: Supports forward-only migration with minimized disruption.

---

## Pattern 2: Manual Visual Regression Verification
- **Intent**: Ensure visual parity without requiring automated tooling.
- **Application**:
  - Capture baseline screenshots from v6 build
  - Compare after each migration phase
  - Accept accessibility improvements, reject regressions
- **NFR Alignment**: Meets manual visual testing requirement and parity tolerance.

---

## Pattern 3: Mantine v7 Defaults Adoption
- **Intent**: Reduce custom overrides and align with v7 styling system.
- **Application**:
  - Remove non-critical custom styles
  - Prefer v7 component defaults and new props where applicable
- **NFR Alignment**: Maintainability and reduced styling debt.

---

## Pattern 4: Strict Type Safety Gate
- **Intent**: Preserve strict TypeScript guarantees during migration.
- **Application**:
  - Update types to v7 APIs
  - Avoid `any` or unsafe casts unless required and justified
  - Run `tsc --noEmit` after each phase
- **NFR Alignment**: TypeScript strictness unchanged.

---

## Pattern 5: Non-Blocking Bundle Monitoring
- **Intent**: Track bundle size without enforcing hard caps.
- **Application**:
  - Monitor `npm run build` output sizes
  - Investigate significant increases only if they impact UX
- **NFR Alignment**: Bundle size is not a blocking constraint.

---

## Pattern 6: Visual-First Validation
- **Intent**: Focus validation on critical user flows with manual checks.
- **Application**:
  - Verify Home search, SearchResults, Cart, Checkout
  - Validate form inputs, date pickers, and buttons
- **NFR Alignment**: Testing strategy emphasizes visual regression over test expansion.
