# Unit 1 — Code Generation Plan: Toolchain & Dependencies

## Plan Status: COMPLETED — AWAITING USER APPROVAL

---

## Objective

Replace the CRA/react-scripts toolchain with Vite + Vitest, pin all dependency versions
to their target major or latest published compatible line, eliminate legacy peer dependency
handling, and migrate the supporting configuration so the project installs cleanly.

No application source migration is included in this unit. React Router, OpenTelemetry,
and Mantine API changes remain in Unit 2 and Unit 3.

---

## Change Steps

### Step 1 — Update `package.json`

- [x] **1.1** Update `dependencies` block
- [x] **1.2** Update `devDependencies` block
- [x] **1.3** Update `scripts` block
- [x] **1.4** Remove `eslintConfig`
- [x] **1.5** Remove `browserslist`
- [x] **1.6** Remove `installConfig.legacyPeerDeps`
- [x] **1.7** Remove stale `_comments`

### Step 2 — Clear `.npmrc`

- [x] **2.1** Remove `legacy-peer-deps=true`

### Step 3 — Create `vite.config.ts`

- [x] **3.1** Create Vite config with React plugin, dev proxy, and inline Vitest config

### Step 4 — Update `tsconfig.json`

- [x] **4.1** Set `moduleResolution` to `bundler`
- [x] **4.2** Set `noEmit` to `true`
- [x] **4.3** Remove declaration output settings
- [x] **4.4** Add `vitest/globals` types
- [x] **4.5** Include `vite.config.ts`
- [x] **4.6** Keep `dist` excluded

### Step 5 — Migrate HTML entrypoint

- [x] **5.1** Create root `index.html`
- [x] **5.2** Delete `public/index.html`

### Step 6 — Remove CRA proxy files

- [x] **6.1** Delete `src/setupProxy.ts`
- [x] **6.2** Delete `src/setupProxy.js`

### Step 7 — Update example env vars

- [x] **7.1** Rename `REACT_APP_FLIGHT_SEARCH` to `VITE_FLIGHT_SEARCH`
- [x] **7.2** Rename `REACT_APP_OPENTELEMETRY_ENDPOINT` to `VITE_OPENTELEMETRY_ENDPOINT`
- [x] **7.3** Document the `VITE_` prefix requirement

### Step 8 — Update test setup

- [x] **8.1** Switch `@testing-library/jest-dom` setup to the Vitest entrypoint

### Step 9 — Validate the toolchain baseline

- [x] **9.1** Run `npm install`
- [x] **9.2** Verify the resolved dependency tree converged on the intended stack
- [x] **9.3** Run baseline `npm run type-check`

---

## Executed Version Set

### Core

- `react` → `^19.2.4`
- `react-dom` → `^19.2.4`
- `react-router` → `^7.13.1`

### UI

- `@mantine/core` → `^8.3.16`
- `@mantine/dates` → `^8.3.16`
- `@mantine/hooks` → `^8.3.16`
- Removed `@emotion/cache`
- Removed `@emotion/react`

### Tooling

- `vite` → `^6.4.1`
- `@vitejs/plugin-react` → `^4.7.0`
- `vitest` → `^3.2.4`
- `@vitest/ui` → `^3.2.4`
- `jsdom` → `^28.1.0`

### OpenTelemetry

- `@opentelemetry/api` → `^1.9.0`
- `@opentelemetry/context-zone` → `^2.6.0`
- `@opentelemetry/exporter-trace-otlp-http` → `^0.213.0`
- `@opentelemetry/instrumentation` → `^0.213.0`
- `@opentelemetry/instrumentation-document-load` → `^0.58.0`
- `@opentelemetry/instrumentation-fetch` → `^0.213.0`
- `@opentelemetry/instrumentation-user-interaction` → `^0.57.0`
- `@opentelemetry/instrumentation-xml-http-request` → `^0.213.0`
- `@opentelemetry/propagator-b3` → `^2.6.0`
- `@opentelemetry/resources` → `^2.6.0`
- `@opentelemetry/sdk-trace-base` → `^2.6.0`
- `@opentelemetry/sdk-trace-web` → `^2.6.0`

### Removed Legacy Items

- `react-scripts`
- `@types/jest`
- `react-router-dom`
- `http-proxy-middleware`

---

## Validation Result

- [x] `npm install` completed with exit code `0`
- [x] Top-level dependency tree resolved to the intended React 19 / Mantine 8 / Router 7 / Vite 6 stack
- [x] `vite.config.ts` is valid TypeScript
- [x] Root-level `index.html` exists and includes the module entrypoint
- [x] Legacy peer-dependency handling was removed

### Remaining TypeScript Errors

The remaining `npm run type-check` failures are expected and are outside Unit 1 scope:

- Unit 2: `react-router-dom` imports still exist in app code
- Unit 2: OpenTelemetry tracing code still targets pre-migration APIs
- Unit 3: Mantine 8 date picker typings require source updates

---

## Files Changed in This Unit

- `package.json`
- `.npmrc`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`
- `.env.example`
- `src/setupTests.ts`
- Deleted `public/index.html`
- Deleted `src/setupProxy.ts`
- Deleted `src/setupProxy.js`

---

## Gate Outcome

Unit 1 is complete. The toolchain and dependency foundation is in place, and the remaining
build breaks are the expected application-level migrations queued for Unit 2 and Unit 3.
