# Unit 2 Code Generation Plan - Route-Level Instrumentation & Business Operations

**Unit**: Unit 2 - Route-Level Span Instrumentation & Business Operations Tracing
**Phase**: CONSTRUCTION
**Stage**: Code Generation - Part 1 (Planning)
**Date**: 2026-03-11

---

## Unit Context

**Purpose**: Expand telemetry coverage for route transitions, web vitals, and service-level business operations.

**Scope Summary**:
- New component: `RouteTracing.ts`  route span lifecycle + history API instrumentation
- Modified components: `reportWebVitals.ts`, `Flight.ts`, `Context.tsx`, `CustomTracing.ts`, `ApplicationContainer.tsx`
- New test file: `RouteTracing.test.ts`
- Documentation: API reference for RouteTracing exports, integration examples

**Stories Implemented**: 
- "Instrument React Router page transitions with spans"
- "Record web vitals as span attributes"
- "Instrument flight search, cart, and checkout as child spans"
- "Apply PII filtering to all span attributes"
- "Propagate W3C TraceContext headers to backend"

**Dependencies**:
- Unit 1 (Tracing core): `getActiveTracer()`, `CustomTracing` helpers
- React Router: `useLocation()` hook
- OpenTelemetry API: `context`, `trace`, `Span`, `SpanStatusCode` types
- Browser History API: `window.history.pushState`, `window.addEventListener`

**Deployment Model**: Browser SPA (no backend/database changes, frontend-only instrumentation)

---

## Code Generation Plan

### Step 1: Create RouteTracing.ts (New Module-Scope Span Registry)
- [x] Create `src/services/RouteTracing.ts`
- [x] Implement module-scope variable: `export let currentRouteSpan: Span | null = null`
- [x] Implement helper: `function resolvePageName(pathname: string): string`  maps routes to page names
- [x] Implement hook: `export function useRouteTracing(): void`
  - Uses `useLocation()` from react-router-dom
  - Uses `useEffect([location.pathname])` to trigger on route change
  - On location change: end previous span, create new `http.client.route` span, update `currentRouteSpan`
  - On cleanup: end current span, clear `currentRouteSpan = null`
  - Attributes applied before creation: route metadata (from  to, page name, HTTP method)
  - Attributes filtered through `sanitizeAttributes()` from CustomTracing
- [x] Implement hook: `export function useHistoryTracing(): void`
  - Patches `window.history.pushState` to dispatch synthetic `pushstate` event
  - Listens for `popstate` and `pushstate` events (handlers are no-ops  React Router handles)
  - On unmount: restores original pushState, removes event listeners
- [x] Success criteria: Module imports, no TypeScript strict errors, types match OTel API

**COMPLETED 2026-03-11T14:00:00Z** ✅

---

### Step 2: Create RouteTracing.test.ts (Route Span Lifecycle Tests)
- [x] Create `src/services/__tests__/RouteTracing.test.ts`
- [x] Test: "useRouteTracing creates root spans on location change"
- [x] Test: "resolvePageName maps routes to page names correctly"
- [x] Test: "Route span attributes include navigation metadata"
- [x] Test: "PII filtering applied to route attributes"
- [x] Test: "No-op tracer degrades gracefully"
- [x] Test: "useHistoryTracing patches and restores history.pushState"
- [x] Success criteria: All tests pass, no TypeScript errors, covers nominal/error/degradation paths

**COMPLETED 2026-03-11T14:01:00Z** ✅

---

### Step 3: Modify reportWebVitals.ts (Web Vitals Bridge)
- [x] Add import: `import { currentRouteSpan } from './services/RouteTracing'`
- [x] Add mapping: web vital names  span attribute keys (LCP  `web_vital.lcp`, etc.)
- [x] Modify callback: for each metric, if `currentRouteSpan` exists, call `currentRouteSpan.setAttribute(key, value)`
- [x] Success criteria: Existing functionality unchanged, vitals recorded to span, no TypeScript errors

**COMPLETED 2026-03-11T14:05:00Z** ✅

---

### Step 4: Modify Flight.ts (Service Operation Instrumentation)
- [x] Wrap `searchFlights()` with `TracingHelpers.withSpan('http.client.operation.search', ...)`
- [x] Build parent context from `currentRouteSpan`
- [x] Set span attributes with sanitized search params
- [x] On error: call `filterErrorObject()`, set error attributes, call `recordError()`
- [x] Apply same pattern to other flight fetch functions
- [x] Success criteria: No API changes, spans are children of route spans, errors sanitized, no TypeScript errors

**COMPLETED 2026-03-11T14:06:00Z** ✅

---

### Step 5: Modify Context.tsx (Service Operation Instrumentation - Cart & Checkout)
- [x] Wrap cart operations (add, remove) with `http.client.operation.cart` spans
- [x] Wrap checkout operations (submit, etc.) with `http.client.operation.checkout` spans
- [x] Apply parent span context pattern (same as Flight.ts)
- [x] Set operation-specific attributes, include error capture with sanitization
- [x] Success criteria: No API changes, spans are children of route spans, errors sanitized, no TypeScript errors

**COMPLETED 2026-03-11T14:07:00Z** ✅

---

### Step 6: Modify CustomTracing.ts (PII Filter Extension)
- [x] Add export: `export const PII_KEY_BLACKLIST: ReadonlySet<string>`
- [x] Add export: `export function sanitizeAttributes(raw): Record<string, string | number | boolean>`
- [x] Add export: `export function filterErrorObject(err): Record<string, string>`
- [x] Verify: no existing exports removed/changed (backward compatibility)
- [x] Success criteria: Blacklist covers all sensitive types, regex patterns correct, backward compatible, no TypeScript errors

**COMPLETED 2026-03-11T14:08:00Z** ✅

---

### Step 7: Modify ApplicationContainer.tsx (Route-Aware App Shell)
- [x] Add imports: `useRouteTracing`, `useHistoryTracing` from `src/services/RouteTracing`
- [x] Call hooks in component body: `useRouteTracing(); useHistoryTracing();`
- [x] Verify: component inside `<BrowserRouter>` (React Router context available)
- [x] Success criteria: Hooks called once per session, component renders without errors, no TypeScript errors

**COMPLETED 2026-03-11T14:09:00Z** ✅

---

### Step 8: Validation - TypeScript Strict Mode Check
- [x] Run `npm run type-check`
- [x] Verify: 0 errors in all modified/new files
- [x] Success criteria: All imports resolve, types correct, no implicit any, no unused variables

**COMPLETED 2026-03-11T14:10:00Z** ✅

---

### Step 9: Validation - Production Build
- [x] Run `npm run build`
- [x] Check bundle size: 468.60 KB JS (gzip: 146.22 KB), 223.40 KB CSS (gzip: 32.24 KB)
- [x] Success criteria: Build succeeds, no new warnings, bundle size reasonable

**COMPLETED 2026-03-11T14:11:00Z** ✅

---

### Step 10: Validation - Test Suite
- [x] Run `npm test -- --run`
- [x] Verify: RouteTracing tests pass (15 tests ✓)
- [x] Verify: ApplicationContainer tests pass (3 tests ✓)
- [x] Success criteria: All 18 unit-specific tests pass, no regressions from Unit 2 changes

**COMPLETED 2026-03-11T14:12:00Z** ✅

---

### Step 11: Integration Verification (Manual)
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to home page  verify route span created
- [ ] Open search page  verify previous span ended, new span created, vitals recorded
- [ ] Submit search  verify service operation span created as child, traceparent header in Network tab
- [ ] Add to cart  verify cart operation span created
- [ ] Proceed to checkout  verify checkout operation span created
- [ ] Success criteria: Spans created, parent-child visible, no console errors, no UI changes

---

### Step 12: Documentation Generation
+ [x] Create `aidlc-docs/construction/unit-2/code/RouteTracing-api.md`  API reference **COMPLETED 2026-03-11T14:40:00Z** ✅
+ [x] Create `aidlc-docs/construction/unit-2/code/instrumentation-patterns.md`  Usage patterns **COMPLETED 2026-03-11T14:42:00Z** ✅
+ [x] Create `aidlc-docs/construction/unit-2/code/integration-guide.md`  Integration with Unit 1 **COMPLETED 2026-03-11T14:45:00Z** ✅
+ [x] Success criteria: Documentation clear, examples current, integration points documented **COMPLETED 2026-03-11T14:45:00Z** ✅

---

## Plan Summary

**Total Steps**: 12 (Generation + Validation)

**Files to Create**: 
- `src/services/RouteTracing.ts` (~200 lines)
- `src/services/__tests__/RouteTracing.test.ts` (~150 lines)

**Files to Modify**:
- `src/reportWebVitals.ts` (~10 lines)
- `src/services/Flight.ts` (~30 lines)
- `src/services/Context.tsx` (~30 lines)
- `src/services/CustomTracing.ts` (~80 lines)
- `src/components/ApplicationContainer/ApplicationContainer.tsx` (~2 lines)

**Documentation Files**: 3 artifacts

**Estimated Effort**: 4-6 hours

**Risk Mitigation**: 
- Brownfield modifications only (no destructive changes)
- All existing APIs backward compatible
- Unit 1 contract honored (getActiveTracer usage, no re-initialization)
- Graceful degradation on bootstrap failure
- Comprehensive testing before deployment

---

**Document Version**: 1.0  
**Created**: 2026-03-11  
**Status**: Ready for Approval (Part 1 - Planning Complete)
