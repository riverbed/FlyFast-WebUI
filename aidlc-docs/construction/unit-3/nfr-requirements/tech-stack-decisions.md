# Unit 3: Mantine v7 Migration - Tech Stack Decisions

## Purpose
Capture technical choices and constraints for the Mantine v7 migration.

---

## Core Decisions

### 1) Mantine Version
- **Decision**: Upgrade all @mantine packages to v7.x.
- **Packages**:
  - @mantine/core
  - @mantine/dates
  - @mantine/hooks
- **Rationale**: Align with requirement to use latest Mantine version and resolve v6 deprecations.

---

### 2) React and Build System
- **Decision**: Keep React 18.3.1 and CRA (react-scripts 5.0.1) during Unit 3.
- **Rationale**: Minimize scope during Mantine migration; build system changes handled in other units.

---

### 3) TypeScript Configuration
- **Decision**: Maintain current strict `tsconfig.json` settings.
- **Rationale**: Preserve current type safety guarantees; no relaxation for migration.

---

### 4) Styling Strategy
- **Decision**: Prefer Mantine v7 defaults; remove custom overrides unless critical.
- **Rationale**: Reduce maintenance burden and align with v7 styling patterns.

---

### 5) Visual Validation
- **Decision**: Manual visual comparison with screenshots before/after.
- **Rationale**: Visual parity is required; manual validation is acceptable for this unit.

---

### 6) Testing Strategy
- **Decision**: Visual regression focus with minimal unit test expansion.
- **Rationale**: Current test coverage is low; prioritize manual verification for UI changes.

---

### 7) Browser Support
- **Decision**: Follow Mantine v7 default browser compatibility.
- **Rationale**: Avoid additional browserslist constraints during migration.

---

### 8) Rollback Strategy
- **Decision**: Forward-only migration, fix issues as they arise.
- **Rationale**: Avoid feature flags; rely on Git history if rollback is necessary.

---

## Operational Constraints
- No new user-facing features added.
- Preserve functional behavior and critical UI flows.
- Avoid major refactors outside Mantine v7 API updates.

---

## Validation Checklist (Unit 3)
- [ ] All Mantine components updated to v7 API
- [ ] No v6 Mantine imports remain
- [ ] Manual visual comparison completed
- [ ] Type-check passes (strict)
- [ ] Development build succeeds
- [ ] Production build succeeds
