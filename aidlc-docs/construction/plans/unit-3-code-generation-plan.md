# Unit 3 Code Generation Plan — Vite Migration Cycle

## Unit Context
**Unit**: 3 — Mantine 8.x Migration and Documentation  
**Scope**: Verify Mantine 8 component compatibility, update Docker infrastructure to match Vite build output, and update README.md for the new stack.  
**Project Type**: Brownfield React SPA  
**Dependencies**: Unit 2 complete (`npm run type-check` passes with 0 errors)

## Stories Implemented
- **User Stories**: Not applicable (skipped — pure technical migration)

## Pre-Unit Assessment
After Unit 2, `npm run type-check` returned **0 errors**. TypeScript validates that all Mantine 8.x component APIs in use are compatible — no component-level source changes are required. All Mantine 7→8 APIs used in this codebase (AppShell, MantineProvider, localStorageColorSchemeManager, useComputedColorScheme, useMantineColorScheme, useHotkeys, useLocalStorage, Stepper, DatePickerInput, Autocomplete, NativeSelect, Button, Grid, Group, etc.) are available in Mantine 8.3 with the same signatures. The `@emotion/cache` and `@emotion/react` packages were already removed in Unit 1's package.json rewrite.

## Files in Scope

| File | Change Type | Change Summary |
|------|-------------|----------------|
| `Dockerfile` | Modify | Node 18→20, remove `--legacy-peer-deps`, `build/`→`dist/`, `REACT_APP_*`→`VITE_*` |
| `default.conf.template` | Modify | `REACT_APP_*` env var names → `VITE_*` |
| `README.md` | Modify | Full rewrite: remove CRA refs, update scripts, env vars, Docker instructions |

---

## Code Generation Steps (Plan)

### Step 1: Update Dockerfile
+ [x] Change base image from `node:18.20.2-alpine` → `node:22-alpine` (align with local Node 22; also satisfies engines>=20)
+ [x] Remove `--legacy-peer-deps` flag from `npm ci` command
+ [x] Remove `--legacy-peer-deps` flag from `npm prune` command
+ [x] Change `COPY --from=react-build /app/build` → `COPY --from=react-build /app/dist`
+ [x] Change `ENV REACT_APP_FLIGHT_SEARCH` → `ENV VITE_FLIGHT_SEARCH`
+ [x] Change `ENV REACT_APP_OPENTELEMETRY_ENDPOINT` → `ENV VITE_OPENTELEMETRY_ENDPOINT`

### Step 2: Update default.conf.template
+ [x] Change `${REACT_APP_FLIGHT_SEARCH}` → `${VITE_FLIGHT_SEARCH}`
+ [x] Change `${REACT_APP_OPENTELEMETRY_ENDPOINT}` → `${VITE_OPENTELEMETRY_ENDPOINT}`

### Step 3: Update README.md
+ [x] Update Prerequisites section (Node 20+ required)
+ [x] Update NodeJS setup: remove `--legacy-peer-deps` from `npm install` command
+ [x] Update env var documentation: `REACT_APP_*` → `VITE_*`; note `import.meta.env`
+ [x] Update Docker run command: `-e REACT_APP_*` → `-e VITE_*`
+ [x] Update Available Scripts section (npm start on 5173, Vitest, dist/, preview, removed eject)
+ [x] Remove TypeScript Configuration section (outdated)
+ [x] Remove Dependency Update Strategy section (outdated)
+ [x] Remove CRA-specific Additional Information links
+ [x] Update Docker Build Notes section

### Step 4: Validation Gate — Full Suite
+ [x] `npm run type-check` → 0 errors
+ [x] `npm test` (Vitest) → all tests pass (1/1 passed)
+  - Note: added `window.matchMedia` mock to `src/setupTests.ts` (required by Mantine's `useMediaQuery` in jsdom)
+ [x] `npm run build` (Vite) → `dist/` produced with no errors (1199 modules, built in 8s)

---

## Story Traceability
- All steps traceable to Unit 3 scope in `aidlc-docs/inception/application-design/unit-of-work.md`

---

## Plan Notes
- Mantine 8 component-level source changes: **none required** (confirmed by 0 type errors in Unit 2)
- Emotion packages: already removed in Unit 1 (not in package.json)
- CSS imports (`@mantine/core/styles.css`, `@mantine/dates/styles.css`): confirmed valid in installed Mantine 8.3.16
- Docker build will use `npm ci` without legacy flags; npm 10+ resolves without peer override
