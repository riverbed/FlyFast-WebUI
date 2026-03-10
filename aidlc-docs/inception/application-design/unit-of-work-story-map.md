# Unit of Work Story Map  Vite Migration Cycle

## Requirements-to-Unit Mapping

| Requirement | Description | Primary Unit | Notes |
|-------------|-------------|--------------|-------|
| FR-1 | Core Dependency Upgrades | Unit 1 | All version pins in package.json |
| FR-2 | React Router Package Migration | Unit 2 | Import path updates in source |
| FR-3 | Build Tool Migration to Vite | Unit 1 | vite.config.ts, index.html, scripts |
| FR-4 | Test Runner Migration to Vitest | Unit 1 + Unit 2 | Config in Unit 1; setup/test files in Unit 2 |
| FR-5 | Remove Legacy Peer Dependency Handling | Unit 1 | .npmrc, package.json installConfig |
| FR-6 | Breaking Change Remediation | Unit 2 + Unit 3 | React/Router/OTel in Unit 2; Mantine in Unit 3 |
| FR-7 | Documentation Updates | Unit 3 | README, .env.example |
| NFR-1 | Compatibility and Stability | All | Validated at each unit handoff gate |
| NFR-2 | Build Reliability | Unit 1 + Unit 3 | Clean install (Unit 1), reproducible vite build (Unit 3) |
| NFR-3 | UX Preservation | Unit 3 | Mantine migration keeps visual parity |
| NFR-4 | Developer Experience | Unit 1 | Vite dev server replaces react-scripts |

---

## File-to-Unit Assignment

### Unit 1 Files

| File | Action | Reason |
|------|--------|--------|
| `package.json` | Update | All dep pins, scripts, remove legacyPeerDeps |
| `.npmrc` | Clear/remove | Remove legacy-peer-deps setting |
| `vite.config.ts` | Create | Build/dev/proxy config |
| `tsconfig.json` | Update | Vite/Vitest compatible module resolution |
| `index.html` (root) | Create | Vite entry point (moved from public/) |
| `public/index.html` | Remove | No longer the entry point |
| `src/setupProxy.js` | Remove | Proxy moves to vite.config.ts |
| `src/setupProxy.ts` | Remove | Same |

### Unit 2 Files

| File | Action | Reason |
|------|--------|--------|
| `src/index.tsx` | Update | Env vars VITE_*, React 19 compat |
| `src/App.tsx` | Update | Router 7 imports |
| `src/pages/Home/Home.tsx` | Update | Router 7 imports if any |
| `src/pages/SearchFlight/SearchFlight.tsx` | Update | useSearchParams, useNavigate |
| `src/pages/Checkout/Checkout.tsx` | Update | Router 7 imports if any |
| `src/components/**/*.tsx` | Update | Router hooks, React 19 patterns |
| `src/services/Context.tsx` | Update | Env vars, React 19 compat |
| `src/services/Flight.ts` | Update | Env vars VITE_* |
| `src/services/Tracing.ts` | Update | OTel 2.6 SDK API |
| `src/services/CustomTracing.ts` | Update | OTel 2.6 API |
| `src/services/Functions.ts` | Verify | Likely no changes needed |
| `src/setupTests.ts` | Update | Vitest-compatible jest-dom import |
| `src/App.test.tsx` | Update | act() import, Vitest globals |
| `.env.example` | Update | REACT_APP_  VITE_ prefix |

### Unit 3 Files

| File | Action | Reason |
|------|--------|--------|
| `src/App.tsx` | Update | MantineProvider theme (Mantine 8) |
| `src/components/ApplicationContainer/ApplicationContainer.tsx` | Update | AppShell API |
| `src/components/ApplicationContainer/ApplicationHeader.tsx` | Update | Group, Button etc. |
| `src/components/Search/Search.tsx` | Update | Autocomplete, NativeSelect, DatePickerInput, Button, Grid |
| `src/components/Search/AirportInformation.tsx` | Verify | If Mantine usage present |
| `src/components/SearchResults/SearchResults.tsx` | Update | LoadingOverlay |
| `src/components/SearchResults/Results.tsx` | Update | Grid |
| `src/components/SearchResults/NoResults.tsx` | Verify | If Mantine usage present |
| `src/components/Cart/Cart.tsx` | Update | Group, Stack, Button |
| `src/components/Cart/FlightDetails.tsx` | Update | If Mantine usage present |
| `src/components/Cart/EmptyCart.tsx` | Verify | If Mantine usage present |
| `src/components/TripCard/TripCard.tsx` | Update | Paper, Group, Text |
| `src/components/TripCard/FlightDetails.tsx` | Update | If Mantine usage present |
| `src/components/Breakdown/Confirmation.tsx` | Update | Mantine Text, Group |
| `src/components/Breakdown/Cost.tsx` | Update | Mantine Text, Stack |
| `src/components/Flight/Flight.tsx` | Verify | If Mantine usage present |
| `src/components/Authentication/Username.tsx` | Verify | If Mantine usage present |
| `src/pages/Checkout/Checkout.tsx` | Update | Stepper component |
| `src/services/Context.tsx` | Update | useLocalStorage (Mantine hooks 8.x) |
| `package.json` | Update | Remove @emotion/* if unused by Mantine 8 |
| `Dockerfile` | Update | COPY dist/ instead of build/ |
| `README.md` | Update | New commands, dependency versions |

---

## Done Criteria Matrix

| Criteria | Validated In |
|----------|-------------|
| `npm install` (no legacy flags) | Unit 1 handoff |
| `tsc --noEmit` passes | Unit 2 handoff |
| `vitest run` passes | Unit 2 handoff |
| `vite build` produces dist/ | Unit 3 completion |
| Dockerfile builds | Unit 3 completion |
| README accurate | Unit 3 completion |
