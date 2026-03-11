# Logical Components - Unit 2: Route-Level Instrumentation

**Unit**: Unit 2 - Route-Level Span Instrumentation & Business Operations Tracing
**Phase**: CONSTRUCTION
**Stage**: NFR Design
**Date Generated**: 2026-03-11

---

## Overview

Six logical components implement the seven design patterns for Unit 2. Each component has a clearly defined responsibility, a single corresponding source file, and explicit integration contracts with other components.

---

## Component Map

`
src/
 services/
    RouteTracing.ts          [NEW]   Component 1: Route Span Controller
                                       Component 2: History Instrumentation Layer
    CustomTracing.ts         [MOD]   Component 5: PII Filter Extension
    Flight.ts                [MOD]   Component 4: Service Operation Wrappers
    Context.tsx              [MOD]   Component 4: Service Operation Wrappers
 reportWebVitals.ts           [MOD]   Component 3: Web Vitals Bridge
 components/
     ApplicationContainer/
         ApplicationContainer.tsx [MOD] Component 6: Route-Aware App Shell
`

---

## Component 1: Route Span Controller

**File**: `src/services/RouteTracing.ts` (new)
**Pattern**: Module-Scope Span Registry (P1) + Hook-Based Lifecycle (P2)

**Responsibility**: Owns the lifecycle of all route transition spans. Creates a new root span on each React Router location change, ends the previous span on the next navigation, and exports the active span reference for consumption by other components.

**Public API**:

`	ypescript
// Module-scope span registry (readable by any importer)
export let currentRouteSpan: Span | null;

// React hook  call once per app session in ApplicationContainer
export function useRouteTracing(): void;

// Route name resolver (exported for testability)
export function resolvePageName(path: string): string;
`

**Internal behavior**:
- `useRouteTracing` hook: `useEffect([location.pathname])`
  - On enter: end previous span (if any), start new `http.client.route` span, update `currentRouteSpan`
  - On cleanup: end current span, set `currentRouteSpan = null`
- Root spans carry these attributes (all filtered via `sanitizeAttributes`):
  - `http.route`: current pathname
  - `http.url.path`: current pathname
  - `http.method`: `GET`
  - `app.route.from`: previous pathname or `(direct)`
  - `app.route.to`: current pathname
  - `app.page.name`: resolved page name (Home / SearchFlight / Checkout / unknown)

**Dependencies**:
- `getActiveTracer` from `Tracing.ts` (Unit 1)
- `sanitizeAttributes` from `CustomTracing.ts` (Component 5)
- `useLocation` from `react-router-dom`
- `@opentelemetry/api` (SpanStatusCode)

**Integration contract for consumers**:
- Import `currentRouteSpan` to get the active span reference
- Never call `Tracing()`  only `getActiveTracer()`
- `currentRouteSpan` may be null; callers must handle null gracefully

---

## Component 2: History Instrumentation Layer

**File**: `src/services/RouteTracing.ts` (new  same file as Component 1)
**Pattern**: History API Delegation (P3)

**Responsibility**: Extends navigation coverage to include non-React Router navigations (direct `history.pushState` calls, browser back/forward). Patches the global History API on mount and restores it cleanly on unmount.

**Public API**:

`	ypescript
// React hook  call once per app session in ApplicationContainer (alongside useRouteTracing)
export function useHistoryTracing(): void;
`

**Internal behavior**:
- On mount: save `window.history.pushState` reference, override with wrapper that calls original + dispatches `pushstate` custom event
- Add `popstate` and `pushstate` event listeners (handlers are no-ops  React Router location changes drive span creation via `useRouteTracing`)
- On unmount: restore original `pushState`, remove event listeners

**Note**: This component does not create spans directly. Its sole job is routing non-React navigations through React Router's location update mechanism, which then triggers `useRouteTracing`.

**Dependencies**:
- `window.history` (browser global)
- No OTel dependencies

---

## Component 3: Web Vitals Bridge

**File**: `src/reportWebVitals.ts` (modified)
**Pattern**: Late-Attribute Injection (P4)

**Responsibility**: Translates browser Web Vitals metrics into OTel span attributes on the active route span. Records each vital as a `web_vital.*` attribute on `currentRouteSpan` as they arrive asynchronously from the browser.

**Modified behavior**:

`	ypescript
// Addition to existing reportWebVitals.ts

import { currentRouteSpan } from './services/RouteTracing';

const VITAL_ATTR: Record<string, string> = {
  LCP:  'web_vital.lcp',
  FCP:  'web_vital.fcp',
  CLS:  'web_vital.cls',
  FID:  'web_vital.fid',
  TTFB: 'web_vital.ttfb',
  INP:  'web_vital.inp',
};

function recordVital(metric: { name: string; value: number }): void {
  const key = VITAL_ATTR[metric.name];
  if (key && currentRouteSpan) {
    currentRouteSpan.setAttribute(key, metric.value);
  }
}
`

**Lifecycle nuance**: Vitals may arrive after `currentRouteSpan` has been replaced by a new navigation span. The attribute is set on whichever span is current at the time of arrival  this is acceptable because vitals are associated with the page that triggered them, and the span for that page transitions before the next navigation.

**Dependencies**:
- `currentRouteSpan` from `RouteTracing.ts` (Component 1)
- `web-vitals` package (already present in `package.json`)

---

## Component 4: Service Operation Wrappers

**Files**: `src/services/Flight.ts` (modified), `src/services/Context.tsx` (modified)
**Pattern**: Context Propagation Bridge (P5) + Blacklist Filter Chain (P6)

**Responsibility**: Wraps service-layer operations (flight search, cart updates, checkout) with child spans that are children of the active route span. Sanitizes all span attributes through the PII filter before recording.

**Operations to wrap**:

| File | Function / Operation | Span Name |
|---|---|---|
| `Flight.ts` | Flight search fetch | `http.client.operation.search` |
| `Flight.ts` | Flight details fetch | `http.client.operation.flight.detail` |
| `Context.tsx` | Add to cart | `http.client.operation.cart.add` |
| `Context.tsx` | Remove from cart | `http.client.operation.cart.remove` |
| `Context.tsx` | Checkout submit | `http.client.operation.checkout` |

**Instrumentation pattern for each operation**:

`	ypescript
import { context, trace } from '@opentelemetry/api';
import { currentRouteSpan } from './RouteTracing';
import { TracingHelpers, sanitizeAttributes } from './CustomTracing';

async function searchFlights(params: SearchParams): Promise<FlightResult[]> {
  const parentCtx = currentRouteSpan
    ? trace.setSpan(context.active(), currentRouteSpan)
    : context.active();

  return context.with(parentCtx, () =>
    TracingHelpers.withSpan('http.client.operation.search', async (span) => {
      span.setAttributes(sanitizeAttributes({
        'app.operation.name': 'searchFlights',
        'app.search.origin': params.origin,
        'app.search.destination': params.destination,
        'app.search.tripType': params.tripType,
        'app.search.seatClass': params.seatClass,
      }));
      // ... existing fetch logic unchanged
    })
  );
}
`

**Error capture** (applied in the `withSpan` callback catch block):
1. Catch the error
2. Call `filterErrorObject(error)` (Component 5) to get sanitized attribute map
3. Call `span.setAttributes(filteredAttrs)` then `TracingHelpers.recordError(span, error)`
4. Re-throw error (existing error handling flow unchanged)

**Dependencies**:
- `currentRouteSpan` from `RouteTracing.ts` (Component 1)
- `TracingHelpers`, `sanitizeAttributes`, `filterErrorObject` from `CustomTracing.ts` (Component 5)
- `context`, `trace` from `@opentelemetry/api`

---

## Component 5: PII Filter Extension

**File**: `src/services/CustomTracing.ts` (modified)
**Pattern**: Blacklist Filter Chain (P6)

**Responsibility**: Provides the shared sanitization functions used by all Unit 2 components. Extends Unit 1's existing `recordSafeError` and `setAttributeSafe` with a comprehensive key blacklist and value-level regex that applies consistently to both route attributes and error objects.

**New exports added to CustomTracing.ts**:

`	ypescript
// Full PII key blacklist
export const PII_KEY_BLACKLIST: ReadonlySet<string>;

// Sanitize a flat attribute map  remove blacklisted keys, scrub values
export function sanitizeAttributes(
  raw: Record<string, unknown>
): Record<string, string | number | boolean>;

// Serialize + sanitize an error object into safe span attributes
export function filterErrorObject(
  err: unknown
): Record<string, string>;
`

**Blacklist coverage**:

| Category | Keys |
|---|---|
| User identity | `userId`, `user_id`, `username`, `sessionId`, `session_id` |
| Booking | `bookingRef`, `booking_ref`, `confirmationCode`, `pnr` |
| Payment | `cardNumber`, `cvv`, `paymentToken`, `accountNumber` |
| Contact | `email`, `phone`, `phoneNumber`, `address` |
| Auth | `token`, `authToken`, `accessToken`, `jwt`, `password` |

**Value-level patterns**:
- Email: `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g`  `[email]`
- Phone: `/\+?[\d\s\-()]{10,15}/g`  `[phone]`
- JWT/Bearer: `/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g`  `[token]`

**Backward compatibility**: No existing `CustomTracing.ts` exports are modified or removed. New exports are purely additive.

---

## Component 6: Route-Aware App Shell

**File**: `src/components/ApplicationContainer/ApplicationContainer.tsx` (modified)
**Pattern**: Anchors Patterns P2 and P3 into the React component tree

**Responsibility**: The single location in the component tree where `useRouteTracing()` and `useHistoryTracing()` are called. This component wraps all routes and persists for the full application lifetime, making it the correct anchor point for both hooks.

**Modified behavior**:

`	ypescript
// Addition to ApplicationContainer component body

import { useRouteTracing, useHistoryTracing } from '../../services/RouteTracing';

export const ApplicationContainer: React.FC = () => {
  useRouteTracing();    // Component 1: starts/ends route spans on location change
  useHistoryTracing();  // Component 2: patches History API for full coverage

  // ... existing JSX unchanged
};
`

**Why here**:
- `ApplicationContainer` is rendered inside `<BrowserRouter>` (so `useLocation` is available)
- It persists for the full session  hooks called here run exactly once and clean up on unmount
- No other changes to routing or layout logic

**Dependencies**:
- `useRouteTracing`, `useHistoryTracing` from `RouteTracing.ts` (Components 1 & 2)

---

## Component Dependency Diagram

`
ApplicationContainer.tsx (C6)
   useRouteTracing()   RouteTracing.ts (C1+C2)
                                               getActiveTracer()   Tracing.ts (Unit 1)
                                               sanitizeAttributes()  CustomTracing.ts (C5)
   useHistoryTracing()  RouteTracing.ts (C2)
                                             (patches window.history.pushState)

reportWebVitals.ts (C3)
   currentRouteSpan  RouteTracing.ts (C1) [module import]

Flight.ts (C4)
   currentRouteSpan  RouteTracing.ts (C1) [module import]
   TracingHelpers  CustomTracing.ts (C5)
   sanitizeAttributes  CustomTracing.ts (C5)
   filterErrorObject  CustomTracing.ts (C5)

Context.tsx (C4)
   (same dependency pattern as Flight.ts)
`

---

## Integration Sequence: Flight Search

`
1. User navigates to /search
    useRouteTracing() starts http.client.route span
    currentRouteSpan = <new root span>

2. User submits search form
    searchFlights(params) called in Flight.ts
    context.with(parent=currentRouteSpan, () => TracingHelpers.withSpan('http.client.operation.search', ...))
    child span started, linked to currentRouteSpan

3. Fetch /api/flights fires
    FetchInstrumentation (Unit 1) auto-instruments the fetch
    traceparent header injected (W3C propagation)
    child span for the HTTP request started under operation.search span

4. Response returns / error thrown
    filterErrorObject (if error) + setAttributes + recordError
    operation.search span ended

5. Browser reports LCP
    reportWebVitals callback fires
    currentRouteSpan.setAttribute('web_vital.lcp', value)

6. User navigates to /checkout
    useRouteTracing() cleanup: end http.client.route span (with web_vital attrs)
    new http.client.route /checkout span started
    currentRouteSpan updated
`

---

## Unit 2 Scope Summary

| Component | File | Action | Patterns |
|---|---|---|---|
| Route Span Controller | `src/services/RouteTracing.ts` | Create | P1, P2 |
| History Instrumentation | `src/services/RouteTracing.ts` | Create | P3 |
| Web Vitals Bridge | `src/reportWebVitals.ts` | Modify | P4 |
| Service Op Wrappers | `src/services/Flight.ts` | Modify | P5, P6 |
| Service Op Wrappers | `src/services/Context.tsx` | Modify | P5, P6 |
| PII Filter Extension | `src/services/CustomTracing.ts` | Modify | P6 |
| Route-Aware App Shell | `src/components/ApplicationContainer/ApplicationContainer.tsx` | Modify | P2, P3 |
| Route Tracing Tests | `src/services/__tests__/RouteTracing.test.ts` | Create | All |

---

**Document Version**: 1.0
**Created**: 2026-03-11
