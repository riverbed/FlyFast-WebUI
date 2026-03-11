import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Span } from '@opentelemetry/api';

// Mock react-router
vi.mock('react-router', () => ({
  useLocation: vi.fn(() => ({ pathname: '/' })),
}));

// Mock dependencies
vi.mock('@/services/Tracing', () => ({
  getActiveTracer: vi.fn(() => ({
    startSpan: vi.fn(() => ({
      setStatus: vi.fn(),
      end: vi.fn(),
      setAttribute: vi.fn(),
      setAttributes: vi.fn(),
    } as unknown as Span)),
  })),
}));

vi.mock('@/services/CustomTracing', () => ({
  sanitizeAttributes: vi.fn((attrs) => attrs), // passthrough for tests
}));

// Import after mocking
import {
  resolvePageName,
  setCurrentRouteSpan,
  getCurrentRouteSpan,
  useRouteTracing,
  useHistoryTracing,
} from '@/services/RouteTracing';

describe('RouteTracing', () => {
  beforeEach(() => {
    setCurrentRouteSpan(null);
    vi.clearAllMocks();
  });

  describe('resolvePageName', () => {
    it('maps / to Home', () => {
      expect(resolvePageName('/')).toBe('Home');
    });

    it('maps /home to Home', () => {
      expect(resolvePageName('/home')).toBe('Home');
    });

    it('maps /search to SearchFlight', () => {
      expect(resolvePageName('/search')).toBe('SearchFlight');
    });

    it('maps /checkout to Checkout', () => {
      expect(resolvePageName('/checkout')).toBe('Checkout');
    });

    it('maps /cart to Cart', () => {
      expect(resolvePageName('/cart')).toBe('Cart');
    });

    it('removes leading slash for unknown paths', () => {
      expect(resolvePageName('/unknown')).toBe('unknown');
    });
  });

  describe('Span registry helpers', () => {
    it('getCurrentRouteSpan returns null when not set', () => {
      expect(getCurrentRouteSpan()).toBeNull();
    });

    it('setCurrentRouteSpan stores and retrieves span', () => {
      const mockSpan = {
        setStatus: vi.fn(),
        end: vi.fn(),
        setAttribute: vi.fn(),
      } as unknown as Span;

      setCurrentRouteSpan(mockSpan);
      expect(getCurrentRouteSpan()).toBe(mockSpan);
    });

    it('setCurrentRouteSpan can clear span by setting to null', () => {
      const mockSpan = {
        setStatus: vi.fn(),
        end: vi.fn(),
      } as unknown as Span;

      setCurrentRouteSpan(mockSpan);
      setCurrentRouteSpan(null);
      expect(getCurrentRouteSpan()).toBeNull();
    });
  });

  describe('Module exports', () => {
    it('exports resolvePageName function', () => {
      expect(typeof resolvePageName).toBe('function');
    });

    it('exports setCurrentRouteSpan test helper', () => {
      expect(typeof setCurrentRouteSpan).toBe('function');
    });

    it('exports getCurrentRouteSpan test helper', () => {
      expect(typeof getCurrentRouteSpan).toBe('function');
    });
  });

  describe('Page name resolution edge cases', () => {
    it('handles paths with query strings', () => {
      // Query strings should be ignored (path only)
      expect(resolvePageName('/search?q=test')).toBe('SearchFlight');
    });

    it('handles paths with trailing slash', () => {
      // Trailing slashes normalized: /search/ -> /search
      expect(resolvePageName('/search/')).toBe('SearchFlight');
    });

    it('handles empty path', () => {
      // Empty path normalized to / -> Home
      expect(resolvePageName('')).toBe('Home');
    });
  });

  describe('useRouteTracing hook lifecycle', () => {
    it('creates a route span on mount', () => {
      const { unmount } = renderHook(() => useRouteTracing());

      // After mount the module-level currentRouteSpan should be set
      expect(getCurrentRouteSpan()).not.toBeNull();

      unmount();
    });

    it('ends span and clears currentRouteSpan on unmount cleanup', () => {
      const { unmount } = renderHook(() => useRouteTracing());

      // Capture the span created during mount
      const createdSpan = getCurrentRouteSpan() as unknown as Record<string, ReturnType<typeof vi.fn>>;
      expect(createdSpan).not.toBeNull();

      unmount();

      // Cleanup callback should have ended the span and nulled the registry
      expect(createdSpan['end']).toHaveBeenCalled();
      expect(createdSpan['setStatus']).toHaveBeenCalled();
      expect(getCurrentRouteSpan()).toBeNull();
    });

    it('ends pre-existing route span when the effect runs with an already-active span', () => {
      // Set a span BEFORE mounting so the effect\'s "end previous" block executes
      const preExistingSpan = {
        setStatus: vi.fn(),
        end: vi.fn(),
        setAttribute: vi.fn(),
        setAttributes: vi.fn(),
      } as unknown as Span;

      setCurrentRouteSpan(preExistingSpan);

      const { unmount } = renderHook(() => useRouteTracing());

      // The effect should have closed the pre-existing span
      expect((preExistingSpan as any).setStatus).toHaveBeenCalledWith({ code: expect.any(Number) });
      expect((preExistingSpan as any).end).toHaveBeenCalled();

      unmount();
    });
  });

  describe('useHistoryTracing hook lifecycle', () => {
    it('patches window.history.pushState on mount', () => {
      const originalPushState = window.history.pushState;

      const { unmount } = renderHook(() => useHistoryTracing());

      // pushState should be replaced with the patched version
      expect(window.history.pushState).not.toBe(originalPushState);

      unmount();
    });

    it('restores window.history.pushState and removes listeners on unmount', () => {
      const { unmount } = renderHook(() => useHistoryTracing());

      // Capture the patched pushState while the hook is mounted
      const patchedPushState = window.history.pushState;

      unmount();

      // After unmount, cleanup should have swapped pushState back to the original
      expect(window.history.pushState).not.toBe(patchedPushState);
    });

    it('dispatches pushstate event when the patched pushState is called', () => {
      const collectedEvents: string[] = [];
      const listener = (e: Event) => collectedEvents.push(e.type);
      window.addEventListener('pushstate', listener);

      const { unmount } = renderHook(() => useHistoryTracing());

      window.history.pushState({}, '', '/tracing-test');

      expect(collectedEvents).toContain('pushstate');

      window.removeEventListener('pushstate', listener);
      unmount();
    });
  });
});
