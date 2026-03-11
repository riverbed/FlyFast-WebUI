# Tech Stack Decisions - Unit 2: Route-Level Instrumentation

**Unit**: Unit 2 - Route-Level Span Instrumentation & Business Operations Tracing
**Phase**: CONSTRUCTION
**Stage**: NFR Requirements
**Date Generated**: 2026-03-11

---

## Decision Summary

| Dimension | Decision | Answer | Details |
|---|---|---|---|
| Span naming | HTTP-style OTel | Q1=A | `http.client.route`, `http.client.operation.*` |
| Overhead budget | No hard limit | Q2=D | Optimize only if reported by users |
| Web vitals | Attributes on route span | Q3=B | Via `reportWebVitals` callback |
| Error capture | Full object + blacklist filter | Q4=A (clarified) | Serialize then scrub PII keys/values |
| PII filtering | Blacklist-based | Q5=B | Key blacklist + value regex patterns |
| Propagation | All outbound requests | Q6=A | W3C TraceContext headers via auto-instrumentation |
| Sampling | 100% | Q7=A | `AlwaysOnSampler` (Unit 1 default) |
| Span hierarchy | Route spans as root spans | Q8=A | No parent relationship to bootstrap |
| Navigation coverage | Full History API | Q9=A | React Router + popstate + pushState listeners |
| Service op parenting | Children of route span | Q10=A | `currentRouteSpan` module-level export |

---

## Implementation Patterns

### Pattern 1: Route Transition Hook

A custom React hook wraps `useLocation` to create and manage route spans.

`	ypescript
// src/services/RouteTracing.ts

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SpanStatusCode, type Span } from '@opentelemetry/api';
import { getActiveTracer } from './Tracing';

export let currentRouteSpan: Span | null = null;

export function useRouteTracing(): void {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const tracer = getActiveTracer();
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    // End previous route span if exists
    if (currentRouteSpan) {
      currentRouteSpan.setStatus({ code: SpanStatusCode.OK });
      currentRouteSpan.end();
    }

    // Start new root span (no parent  Q8=A)
    currentRouteSpan = tracer.startSpan('http.client.route', {
      attributes: {
        'http.route': currentPath,
        'http.url.path': currentPath,
        'http.method': 'GET',
        'app.route.from': prevPath ?? '(direct)',
        'app.route.to': currentPath,
        'app.page.name': resolvePageName(currentPath),
      },
    });

    prevPathRef.current = currentPath;

    return () => {
      // Cleanup on unmount
      if (currentRouteSpan) {
        currentRouteSpan.end();
        currentRouteSpan = null;
      }
    };
  }, [location.pathname]);
}

function resolvePageName(path: string): string {
  if (path === '/' || path === '/home') return 'Home';
  if (path.startsWith('/search')) return 'SearchFlight';
  if (path.startsWith('/checkout')) return 'Checkout';
  return path;
}
`

---

### Pattern 2: History API Coverage

Separate `useEffect` with no dependencies patches `history.pushState` and listens for `popstate`.

`	ypescript
// Called once in App.tsx or ApplicationContainer

export function useHistoryTracing(): void {
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);

    window.history.pushState = function (...args) {
      originalPushState(...args);
      window.dispatchEvent(new Event('pushstate'));
    };

    const handleNavigation = () => {
      // React Router's useLocation will re-fire, which triggers useRouteTracing
      // This listener is a safety net for non-Router navigations
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
    };
  }, []);
}
`

---

### Pattern 3: Web Vitals Integration

Modify `reportWebVitals.ts` to record vitals as attributes on `currentRouteSpan`.

`	ypescript
// src/reportWebVitals.ts (updated)

import { currentRouteSpan } from './services/RouteTracing';

const VITAL_ATTRIBUTE_MAP: Record<string, string> = {
  LCP: 'web_vital.lcp',
  FCP: 'web_vital.fcp',
  CLS: 'web_vital.cls',
  FID: 'web_vital.fid',
  TTFB: 'web_vital.ttfb',
  INP: 'web_vital.inp',
};

function recordVital(metric: { name: string; value: number }): void {
  const attrKey = VITAL_ATTRIBUTE_MAP[metric.name];
  if (attrKey && currentRouteSpan) {
    currentRouteSpan.setAttribute(attrKey, metric.value);
  }
}
`

---

### Pattern 4: Service Operation Span as Child of Route Span

Service calls pass `currentRouteSpan` as parent context.

`	ypescript
// Usage in a service (e.g., src/services/Flight.ts)

import { context, trace } from '@opentelemetry/api';
import { currentRouteSpan } from './RouteTracing';
import { TracingHelpers } from './CustomTracing';

export async function searchFlights(params: SearchParams): Promise<FlightResult[]> {
  const parentCtx = currentRouteSpan
    ? trace.setSpan(context.active(), currentRouteSpan)
    : context.active();

  return context.with(parentCtx, () =>
    TracingHelpers.withSpan('http.client.operation.search', async (span) => {
      span.setAttributes({
        'app.operation.name': 'searchFlights',
        'app.search.origin': params.origin,
        'app.search.destination': params.destination,
        'app.search.tripType': params.tripType,   // safe  whitelisted
        'app.search.seatClass': params.seatClass, // safe  whitelisted
      });
      // fetch / API call ...
    })
  );
}
`

---

### Pattern 5: Error Capture with Blacklist Filter

Applied in `CustomTracing.ts` (already partially implemented in Unit 1). Unit 2 extends this.

`	ypescript
// Blacklist keys that must never appear in span attributes
const PII_KEY_BLACKLIST = new Set([
  'userId', 'user_id', 'username', 'sessionId', 'session_id',
  'bookingRef', 'booking_ref', 'confirmationCode', 'pnr',
  'cardNumber', 'cvv', 'paymentToken', 'accountNumber',
  'email', 'phone', 'phoneNumber', 'address',
  'token', 'authToken', 'accessToken', 'jwt', 'password',
]);

function filterErrorObject(err: unknown): Record<string, string> {
  const raw: Record<string, unknown> =
    err instanceof Error
      ? { 'error.type': err.name, 'error.message': err.message }
      : { 'error.type': 'UnknownError', 'error.message': String(err) };

  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (PII_KEY_BLACKLIST.has(key)) continue;
    const strValue = sanitizeValue(String(value));
    filtered[key] = strValue;
  }
  return filtered;
}

function sanitizeValue(value: string): string {
  return value
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
    .replace(/\+?[\d\s\-()]{10,15}/g, '[phone]')
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, '[token]');
}
`

---

## Files to Create / Modify in Unit 2

| File | Action | Purpose |
|---|---|---|
| `src/services/RouteTracing.ts` | **Create** | Route span lifecycle with `useRouteTracing` and `useHistoryTracing` hooks |
| `src/reportWebVitals.ts` | **Modify** | Add vital  span attribute recording via `currentRouteSpan` |
| `src/components/ApplicationContainer/ApplicationContainer.tsx` | **Modify** | Add `useRouteTracing()` and `useHistoryTracing()` calls |
| `src/services/Flight.ts` | **Modify** | Wrap `searchFlights` and related functions with child span parenting |
| `src/services/Context.tsx` | **Modify** | Wrap cart/checkout operations with child span parenting |
| `src/services/CustomTracing.ts` | **Modify** | Extend `filterErrorObject` and `sanitizeValue` with full PII blacklist |
| `src/services/__tests__/RouteTracing.test.ts` | **Create** | Unit tests for route span lifecycle |

---

## Quality Gate Summary

| Gate | Command | Expected Result |
|---|---|---|
| Type-check | `npm run type-check` | 0 errors |
| Build | `npm run build` | No errors, bundle similar size |
| Tests | `npm test -- --run` | All pass |
| PII check | Manual review of test spy calls | No blacklisted keys in setAttribute calls |

---

**Document Version**: 1.0
**Created**: 2026-03-11
