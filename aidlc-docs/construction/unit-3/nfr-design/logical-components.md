# Unit 3: Mantine v8 Migration - Logical Components

## Overview
Logical components represent the non-functional infrastructure and validation workflow needed to safely migrate Mantine v6 -> v8.

---

## 1) Migration Sequencer
- **Purpose**: Track migration phases and enforce sequencing.
- **Responsibility**:
  - Hooks → Layout → Complex components
  - Prevent mixing v6 and v7 APIs within a component

---

## 2) Visual Baseline Capture
- **Purpose**: Establish visual reference for v6 state.
- **Responsibility**:
  - Capture screenshots for Home, SearchFlight, Checkout pages
  - Capture key components (Search form, TripCard, Cart)

---

## 3) Visual Comparison Checklist
- **Purpose**: Manual checklist for post-migration validation.
- **Responsibility**:
  - Compare layout, spacing, typography, and color
  - Confirm accessibility improvements are acceptable
  - Flag regressions immediately

---

## 4) Type Safety Gate
- **Purpose**: Ensure strict TypeScript compliance after each phase.
- **Responsibility**:
  - Run `npm run type-check`
  - Resolve v7 typing changes without loosening strictness

---

## 5) Build Verification Gate
- **Purpose**: Validate that build artifacts remain healthy.
- **Responsibility**:
  - Run `npm run build` after migration phases
  - Review bundle size changes (non-blocking)

---

## 6) Change Notes Capture
- **Purpose**: Minimal documentation for non-obvious v7 changes.
- **Responsibility**:
  - Add inline comments where v7 API changes are non-obvious
  - Avoid standalone migration documentation
