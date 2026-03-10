# Unit 2 Code Generation Plan — Vite Migration Cycle

## Unit Context
**Unit**: 2 — Application Code Migration  
**Scope**: Update source code to compile and run correctly against React Router 7, and OpenTelemetry 2.x APIs. Fix all remaining TypeScript errors from the Unit 1 baseline type-check.  
**Project Type**: Brownfield React SPA  
**Dependencies**: Unit 1 complete (Vite toolchain installed, package.json updated)

## Stories Implemented
- **User Stories**: Not applicable (skipped — pure technical migration)

## Baseline State (from Unit 1 type-check)
18 TypeScript errors across 8 files:
- `src/App.tsx` (1 error): `react-router-dom` module not found
- `src/components/ApplicationContainer/ApplicationHeader.tsx` (1 error): `react-router-dom` module not found
- `src/components/Authentication/Username.tsx` (1 error): `react-router-dom` module not found
- `src/components/Search/Search.tsx` (3 errors): `react-router-dom` not found + `DatesRangeValue<string>` cast incompatibility
- `src/components/SearchResults/SearchResults.tsx` (1 error): `react-router-dom` module not found
- `src/pages/SearchFlight/SearchFlight.tsx` (1 error): `react-router-dom` module not found
- `src/services/CustomTracing.ts` (5 errors): `Resource` is a type only (not a value); `addSpanProcessor` removed from `WebTracerProvider`
- `src/services/Tracing.ts` (5 errors): same OTel API errors as CustomTracing.ts

## Files in Scope

| File | Change Type | Change Summary |
|------|-------------|----------------|
| `src/App.tsx` | Modify | `react-router-dom` → `react-router` |
| `src/components/ApplicationContainer/ApplicationHeader.tsx` | Modify | `react-router-dom` → `react-router` |
| `src/components/Authentication/Username.tsx` | Modify | `react-router-dom` → `react-router` |
| `src/components/Search/Search.tsx` | Modify | `react-router-dom` → `react-router`; fix `DatesRangeValue` type casts |
| `src/components/SearchResults/SearchResults.tsx` | Modify | `react-router-dom` → `react-router` |
| `src/pages/SearchFlight/SearchFlight.tsx` | Modify | `react-router-dom` → `react-router` |
| `src/services/Tracing.ts` | Modify | `Resource` → `resourceFromAttributes`; `spanProcessors` in constructor |
| `src/services/CustomTracing.ts` | Modify | `Resource` → `resourceFromAttributes`; `spanProcessors` in constructor |

---

## Code Generation Steps (Plan)

### Step 1: React Router 7 Import Migration
- [x] `src/App.tsx`: `from "react-router-dom"` → `from "react-router"`
- [x] `src/components/ApplicationContainer/ApplicationHeader.tsx`: `from "react-router-dom"` → `from "react-router"`
- [x] `src/components/Authentication/Username.tsx`: `from "react-router-dom"` → `from "react-router"`
- [x] `src/components/Search/Search.tsx`: `from "react-router-dom"` → `from "react-router"`
- [x] `src/components/SearchResults/SearchResults.tsx`: `from "react-router-dom"` → `from "react-router"`
- [x] `src/pages/SearchFlight/SearchFlight.tsx`: `from "react-router-dom"` → `from "react-router"`

**Reasoning**: React Router 7 merged `react-router-dom` back into `react-router`. All previously DOM-specific exports (`BrowserRouter`, `Link`, `Routes`, `Route`, `useNavigate`, `useSearchParams`) are now re-exported from the main `react-router` package. The `react-router-dom` package is no longer installed.

### Step 2: OpenTelemetry 2.x API Migration — `src/services/Tracing.ts`
- [x] Replace `import { Resource } from "@opentelemetry/resources"` with `import { resourceFromAttributes } from "@opentelemetry/resources"`
- [x] Replace `new Resource({ "service.name": serviceName })` with `resourceFromAttributes({ "service.name": serviceName })`
- [x] Remove sequential `provider.addSpanProcessor()` calls
- [x] Pass `spanProcessors` array directly to `WebTracerProvider` constructor  
  **Production**: `[new BatchSpanProcessor(collector)]`  
  **Development**: `[new SimpleSpanProcessor(new ConsoleSpanExporter()), new SimpleSpanProcessor(collector)]`

**Reasoning**: In `@opentelemetry/resources` 2.x, `Resource` is now an interface (type only); to create a resource instance call `resourceFromAttributes()`. In `@opentelemetry/sdk-trace-web` 2.x (via `sdk-trace-base`), `addSpanProcessor()` was removed from `BasicTracerProvider`/`WebTracerProvider`; span processors must be supplied via the `spanProcessors: SpanProcessor[]` field in `TracerConfig`.

### Step 3: OpenTelemetry 2.x API Migration — `src/services/CustomTracing.ts`
- [x] Apply the same `Resource` → `resourceFromAttributes` change as in Step 2
- [x] Apply the same `spanProcessors` constructor pattern as in Step 2

### Step 4: Mantine 8 Date Type Fixes — `src/components/Search/Search.tsx`
- [x] Fix the `DatesRangeValue<string>` cast in the range `DatePickerInput` `onChange` handler:  
  `input as [Date, Date]` → `(input as unknown) as [Date, Date]`
- [x] Fix the single-date `DatePickerInput` `onChange` handler:  
  `input as Date` → `(input as unknown) as Date`

**Reasoning**: Mantine 8 widened the `DatePickerInput` `onChange` callback type to `DatesRangeValue<string>` (which can hold `string | null` in its tuple positions), making a direct `as [Date, Date]` cast a TypeScript error because the types don't sufficiently overlap. The double-cast through `unknown` expresses deliberate intent and resolves the type error.

### Step 5: Validation Gate — type-check
- [x] Run `npm run type-check` and confirm 0 errors

---

## Story Traceability
- User Stories: Not applicable (skipped in workflow)
- All steps traceable to Unit 2 scope in `aidlc-docs/inception/application-design/unit-of-work.md`

---

## Plan Notes
- All file modifications are in-place (no duplicate files created).
- No new components, services, or files are created in this unit.
- `src/index.tsx`, `src/App.test.tsx`, and `src/setupTests.ts` require no changes for type-check to pass (already clean or handled in Unit 1).
- `process.env.NODE_ENV` usage in `Tracing.ts` and `CustomTracing.ts` is intentionally preserved — Vite replaces it at bundle time, and TypeScript resolves it via `@types/node`.
- Unit 3 owns all remaining Mantine 8 API breaking changes (component props, AppShell, theme structure, etc.).
