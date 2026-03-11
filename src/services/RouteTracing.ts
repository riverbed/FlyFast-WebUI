import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { SpanStatusCode, type Span, type Attributes } from '@opentelemetry/api';
import { getActiveTracer } from '@/services/Tracing';
import { sanitizeAttributes } from '@/services/CustomTracing';

/**
 * Module-scope registry for the currently active route span.
 * Exported and readable by any importer (service modules, components, etc.)
 * Updated whenever a route navigation occurs.
 */
export let currentRouteSpan: Span | null = null;

/**
 * Sets the current active route span (for testing/internals).
 */
export function setCurrentRouteSpan(span: Span | null): void {
  currentRouteSpan = span;
}

/**
 * Gets the current active route span (for testing/internals).
 */
export function getCurrentRouteSpan(): Span | null {
  return currentRouteSpan;
}

/**
 * Resolves a pathname to a human-readable page name.
 * Used for the 'app.page.name' span attribute.
 */
export function resolvePageName(pathname: string): string {
  // Normalize: remove trailing slashes for comparison
  const normalized = pathname.replace(/\/$/, '') || '/';
  
  if (normalized === '/' || normalized === '/home') return 'Home';
  if (normalized.startsWith('/search')) return 'SearchFlight';
  if (normalized.startsWith('/checkout')) return 'Checkout';
  if (normalized.startsWith('/cart')) return 'Cart';
  return normalized.slice(1) || 'Home'; // fallback: use path segment or Home
}

/**
 * React hook that manages the lifecycle of route transition spans.
 *
 * Behavior:
 * - On mount and on every location change, ends the previous route span and creates a new one
 * - Attributes: http.route, http.url.path, http.method, app.route.from, app.route.to, app.page.name
 * - All attributes are sanitized through sanitizeAttributes before creation
 * - On unmount or route change, the previous span is ended with OK status
 *
 * Should be called once per app session in the route-aware container component
 * (typically in ApplicationContainer, inside <BrowserRouter>).
 *
 * @example
 * export const ApplicationContainer: React.FC = () => {
 *   useRouteTracing();
 *   useHistoryTracing();
 *   return <RouterContent />;
 * };
 */
export function useRouteTracing(): void {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const tracer = getActiveTracer();
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // End previous route span if it exists
    if (currentRouteSpan) {
      currentRouteSpan.setStatus({ code: SpanStatusCode.OK });
      currentRouteSpan.end();
    }

    // Create new root span (no parent — independent root per route)
    const rawAttrs = {
      'http.route': currentPath,
      'http.url.path': currentPath,
      'http.method': 'GET',
      'app.route.from': prevPath ?? '(direct)',
      'app.route.to': currentPath,
      'app.page.name': resolvePageName(currentPath),
    };

    // Apply PII filtering before creating span
    const safeAttrs = sanitizeAttributes(rawAttrs) as Attributes;

    currentRouteSpan = tracer.startSpan('http.client.route', {
      attributes: safeAttrs,
    });

    prevPathRef.current = currentPath;

    // Cleanup: end span on unmount or next navigation
    return () => {
      if (currentRouteSpan) {
        currentRouteSpan.setStatus({ code: SpanStatusCode.OK });
        currentRouteSpan.end();
        currentRouteSpan = null;
      }
    };
  }, [location.pathname]);
}

/**
 * React hook that extends navigation coverage to non-React Router navigations.
 *
 * Behavior:
 * - Patches window.history.pushState to dispatch a synthetic 'pushstate' custom event
 * - Listens for 'popstate' (browser back/forward) and 'pushstate' (direct history API calls)
 * - Handlers are no-ops; React Router's location change drives span creation via useRouteTracing
 * - On unmount, restores the original pushState and removes event listeners
 *
 * Should be called once per app session (alongside useRouteTracing) in the route-aware container.
 *
 * @example
 * export const ApplicationContainer: React.FC = () => {
 *   useRouteTracing();
 *   useHistoryTracing();
 *   return <RouterContent />;
 * };
 */
export function useHistoryTracing(): void {
  useEffect(() => {
    // Save original pushState
    const originalPushState = window.history.pushState.bind(window.history);

    // Override pushState to dispatch custom event (triggers React Router location update)
    window.history.pushState = function (...args: Parameters<typeof window.history.pushState>) {
      originalPushState(...args);
      // Dispatch synthetic event to ensure React Router location updates
      window.dispatchEvent(new Event('pushstate'));
    };

    // Handler for both popstate (browser back/forward) and pushstate (direct history API)
    // React Router's useLocation hook will fire and trigger useRouteTracing
    const handleNavigation = (): void => {
      // No-op handler; React Router location updates trigger useRouteTracing
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);

    // Cleanup: restore original pushState and remove listeners
    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
    };
  }, []);
}
