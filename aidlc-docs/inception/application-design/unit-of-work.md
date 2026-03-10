# Unit of Work Definitions  Vite Migration Cycle

## Overview

Three sequential units execute this migration. Each unit is fully complete before the next begins.
Completion gate for the entire cycle: `npm install` (clean) + `npm run type-check` + `npm test` (Vitest) + `npm run build` (Vite) all pass.

---

## Unit 1  Toolchain and Dependencies

### Purpose
Replace the complete build and test toolchain, pin all dependency major versions, and eliminate legacy peer dependency handling. This unit establishes the foundation that Units 2 and 3 build on.

### Scope

**Dependency changes:**
- Remove: `react-scripts`, `@types/jest`, `@testing-library/jest-dom` (will be re-added as Vitest-compatible versions)
- Add: `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/ui`, `@testing-library/jest-dom` (vitest-compatible)
- Update to target versions:
  - `react`  19.2.x
  - `react-dom`  19.2.x
  - `@types/react`  19.x
  - `@types/react-dom`  19.x
  - `react-router-dom`  removed; `react-router`  7.x
  - `@mantine/*`  8.3.x family
  - `@opentelemetry/*`  compatible 2.x / 0.57+ stable set
  - `web-vitals`  latest
  - `react-icons`  latest
  - `dayjs`  latest
  - `http-proxy-middleware`  keep (used in Vite proxy)
  
**Config files created/updated:**
- `vite.config.ts`  new file; dev server, proxy config (replacing setupProxy.js/.ts), React plugin, env prefix `VITE_`
- `vitest.config.ts` (or inline in vite.config.ts)  jsdom environment, setupFiles, globals
- `tsconfig.json`  target ES2020+, moduleResolution node/bundler, types updated (remove @types/jest)
- `package.json`  scripts: `start`  `vite`, `build`  `vite build`, `test`  `vitest run`, `preview`  `vite preview`; remove `eslintConfig` (migrated to eslint.config.js if needed); remove `installConfig.legacyPeerDeps`; remove `browserslist` (handled by Vite)
- `.npmrc`  remove `legacy-peer-deps=true`
- `public/index.html`  **moved** to root-level `index.html` as Vite entry point; `%PUBLIC_URL%` tokens cleaned up; `<script type="module" src="/src/index.tsx">` added

**Files removed:**
- `src/setupProxy.js` and `src/setupProxy.ts`  proxy moved to vite.config.ts
- `src/reportWebVitals.ts`  optional; retain if desired, update imports if needed

### Success Criteria
- [ ] `npm install` completes without errors or legacy peer flag
- [ ] `node_modules` has no conflicting peer dependency warnings at error level
- [ ] `vite.config.ts` and test config are syntactically valid TypeScript
- [ ] `public/index.html` (now `index.html` at root) is valid and Vite-compatible
- [ ] `package.json` scripts reference Vite commands

### Deliverables
- Updated `package.json`
- Deleted/cleared `.npmrc`
- New `vite.config.ts`
- Updated `tsconfig.json`
- New root-level `index.html`
- Removed `src/setupProxy.js` and `src/setupProxy.ts`

---

## Unit 2  Application Code Migration

### Purpose
Update source code to compile and run correctly against React 19, React Router 7, and OpenTelemetry 2.6 APIs. Move test infrastructure to Vitest.

### Scope

**React Router 7 migration:**
- Remove `react-router-dom` package imports throughout; replace with `react-router`
- React Router 7 re-exports all previously DOM-specific APIs from the main `react-router` package when using `createBrowserRouter` or via module flags
- Key updated imports: `BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useSearchParams`, `Link`, `useLocation`
- Evaluate whether to stay with declarative `<BrowserRouter>` pattern or adopt `createBrowserRouter`; use whichever compiles without error

**React 19 migration:**
- `React.createRef` / callback ref patterns (minor updates if TypeScript errors arise)
- ReactDOM.render is already removed (was done in prior cycle using root API)
- `act()` import path changes (from `react` rather than `react-dom/test-utils` for tests)
- Remove any deprecated `defaultProps` on function components if TypeScript errors
- Handle any React 19 strict mode double-invocation behavior differences in tests

**OpenTelemetry 2.6 migration (`src/services/Tracing.ts`, `src/services/CustomTracing.ts`):**
- Review `@opentelemetry/api` 2.x changes (noop tracer, context API)
- Review `@opentelemetry/sdk-trace-web` / `sdk-trace-base` 2.x changes
- Review `@opentelemetry/instrumentation` 0.57+ API surface changes
- Update registration/provider setup patterns to match new SDK initializer APIs
- Check `@opentelemetry/context-zone` compatibility; replace with `@opentelemetry/context-async-hooks` if browser target issue

**Environment variable migration:**
- All `process.env.REACT_APP_*` references  `import.meta.env.VITE_*`
- Update `.env.example` with `VITE_` prefixed variable names
- Update `default.conf.template` env var injection if it reflects REACT_APP names

**Test infrastructure migration:**
- `src/setupTests.ts`  replace `@testing-library/jest-dom` Jest-specific import with Vitest-compatible version
- `src/App.test.tsx`  update `act()` import, ensure test works under Vitest
- Remove any `@types/jest` globals usage; use Vitest's `describe`/`it`/`expect` globals (if `globals: true` set in vitest config)

### Success Criteria
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm test` (Vitest) passes all tests
- [ ] Application starts in dev mode (`npm start`) without crash
- [ ] Routing navigates correctly between pages

### Deliverables
- Updated routing imports in `src/App.tsx` and all page/component files using router APIs
- Updated `src/services/Tracing.ts` and `src/services/CustomTracing.ts`
- Updated `src/setupTests.ts`
- Updated `src/App.test.tsx`
- Updated `.env.example`
- Updated `src/index.tsx` (env var references)
- Env var references patched in all service files

---

## Unit 3  Mantine 8.x Migration and Documentation

### Purpose
Update all Mantine component usage from 7.x API to 8.x API, verify the Docker build still works, and update README.

### Scope

**Mantine 8.x migration:**

Breaking changes to address (from Mantine 78 migration guide):
- `MantineProvider` theme structure changes (cssVariablesResolver, theme defaults)
- `AppShell` API changes if any
- Component prop renames / removed props
- `@mantine/dates` API surface changes for `DatePickerInput`
- `useLocalStorage` hook changes in `@mantine/hooks`
- Emotion  CSS-in-JS changes (Mantine 8 ships with no Emotion dependency; `@emotion/cache` and `@emotion/react` may be removable)
- CSS import strategy: verify `@mantine/core/styles.css` import still valid or updated import path

**Affected files:**
- `src/App.tsx`  MantineProvider / ColorSchemeScript
- `src/components/ApplicationContainer/ApplicationContainer.tsx`  AppShell, theme
- `src/components/ApplicationContainer/ApplicationHeader.tsx`  Group, Button, etc.
- `src/components/Search/*.tsx`  Autocomplete, NativeSelect, DatePickerInput, Button, Grid, etc.
- `src/components/SearchResults/*.tsx`  Grid, Group, Paper, LoadingOverlay
- `src/components/Cart/*.tsx`  Group, Stack, Text, Button
- `src/components/TripCard/*.tsx`  Paper, Group, Text, Badge
- `src/components/Breakdown/*.tsx`  Text, Group, Stack
- `src/components/Flight/Flight.tsx`  any Mantine usage
- `src/services/Context.tsx`  `useLocalStorage` from `@mantine/hooks`
- `src/pages/**/*.tsx`  Stepper or other Mantine page-level usage

**Emotion cleanup:**
- Remove `@emotion/cache` and `@emotion/react` from package.json if unused by Mantine 8

**Docker verification:**
- Run `npm run build` and confirm output in `dist/` (Vite default) not `build/`
- Update `Dockerfile` COPY path from `build/` to `dist/`
- Verify multi-stage Docker build produces valid container

**Documentation:**
- `README.md`  update scripts table (start/build/test/preview), note Vite migration, note React Router package migration, note dependency versions
- Remove references to `react-scripts`, `REACT_APP_` env vars, Jest

### Success Criteria
- [ ] `npm run build` (Vite) produces `dist/` with no errors
- [ ] `npm run type-check` still passes after Mantine 8 changes
- [ ] `npm test` still passes
- [ ] Docker build succeeds (Dockerfile COPY `dist/`)
- [ ] All Mantine components render visually as expected

### Deliverables
- All updated component files
- Updated `Dockerfile`
- Updated `README.md`
- Cleaned `package.json` (Emotion packages removed if unused)

---

## Inter-Unit Dependencies

```
Unit 1 (Toolchain) ---> Unit 2 (App Code) ---> Unit 3 (Mantine + Docs)
     |                        |                         |
  Vite/Vitest             Router 7 imports          Mantine 8 APIs
  installed               OTel 2.6 APIs             Docker build path
  pkg.json clean          Env var prefix             README updated
```

Unit 2 cannot start until Unit 1 installs cleanly and the project compiles.
Unit 3 cannot start until Unit 2 achieves a passing type-check and test run.
