# Unit of Work Dependency Matrix  Vite Migration Cycle

## Execution Constraint: Strictly Sequential

All three units execute in order:
Unit 1  Unit 2  Unit 3

No parallelisation is possible because each unit's output is required for the next unit to compile.

---

## Dependency Graph

```
+-------------------+     +---------------------+     +--------------------+
|   Unit 1          |     |   Unit 2             |     |   Unit 3           |
|   Toolchain &     | --> |   App Code           | --> |   Mantine 8.x +    |
|   Dependencies    |     |   Migration          |     |   Docs             |
+-------------------+     +---------------------+     +--------------------+
|                   |     |                     |     |                    |
| OUTPUT:           |     | REQUIRES:           |     | REQUIRES:          |
| - node_modules    |     | - Vite installed    |     | - App code         |
|   with correct    |     | - TS config valid   |     |   compiling        |
|   dep versions    |     | - React 19 pkgs     |     | - Vitest passing   |
| - vite.config.ts  |     | - Router 7 pkgs     |     | - type-check clean |
| - tsconfig.json   |     | - OTel 2.6 pkgs     |     |                    |
| - index.html root |     |                     |     | OUTPUT:            |
| - package.json    |     | OUTPUT:             |     | - Mantine 8 API    |
|   clean scripts   |     | - Routing fixed     |     |   updates done     |
| - .npmrc cleared  |     | - OTel APIs updated |     | - dist/ build OK   |
|                   |     | - Env vars VITE_*   |     | - Docker updated   |
|                   |     | - Tests run Vitest  |     | - README updated   |
+-------------------+     +---------------------+     +--------------------+
```

---

## Handoff Points

### Unit 1  Unit 2 Handoff Gate

Before Unit 2 begins, all of the following must be true:
- `npm install` exits cleanly (exit code 0, no peer conflict errors)
- `vite.config.ts` is syntactically valid TypeScript
- `tsconfig.json` does not error on `tsc --noEmit`
- `index.html` exists at project root with correct Vite entry point

Note: TypeScript errors in application source files are expected at this point (Router 7, React 19, OTel 2.6 API mismatches) and are resolved in Unit 2.

### Unit 2  Unit 3 Handoff Gate

Before Unit 3 begins, all of the following must be true:
- `npm run type-check` passes (0 TypeScript errors)
- `npm test` (Vitest) passes all test suites
- Dev server starts (`npm start`) without crash

Note: Mantine API type errors are expected at this point and are resolved in Unit 3.

### Unit 3  Build and Test Gate

Unit 3 completes when:
- All Mantine type errors resolved
- `npm run build` (Vite) produces `dist/` without errors
- Docker `COPY dist/` builds successfully

---

## Risk Analysis

| Risk | Unit | Impact | Mitigation |
|------|------|--------|------------|
| React 19 + Mantine 8 peer conflict | 1 | High | Check actual npm output; use `overrides` if needed |
| OTel 2.6 API surface changes | 2 | Medium | Read @opentelemetry/api 2.x changelog; adapt registration |
| Router 7 import breakage | 2 | Medium | Systematic find/replace of react-router-dom imports |
| Mantine 8 deprecated props | 3 | Medium | Follow official migration guide for each component |
| Docker COPY path change builddist | 3 | Low | Single-line Dockerfile change |

---

## Module Update Order (Within Units)

### Unit 2 internal order
1. `package.json` + install (is Unit 1 output but confirmed clean here)
2. Services first: `Tracing.ts`, `CustomTracing.ts`, `Context.tsx`
3. Utilities: `Functions.ts`
4. Entry points: `src/index.tsx`, `src/App.tsx`
5. Pages: `Home`, `SearchFlight`, `Checkout`
6. Components: bottom-up (leaf components first, then containers)
7. Tests last: `setupTests.ts`, `App.test.tsx`

### Unit 3 internal order
1. `MantineProvider` / theme in `App.tsx` / `ApplicationContainer`
2. Layout components: `ApplicationContainer`, `ApplicationHeader`
3. Feature components: `Search/*`, `Cart/*`, `TripCard/*`, `Breakdown/*`
4. Page components
5. `package.json` emotion removal
6. Dockerfile update
7. README update
