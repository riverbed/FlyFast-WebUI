/**
 * Purpose: This file (setupTests.ts) supports the src area of the FlyFast booking workflow.
 */
import "@testing-library/jest-dom/vitest";

// jsdom does not implement window.matchMedia; Mantine's useMediaQuery requires it.
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// Mantine components rely on ResizeObserver in several controls.
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	value: ResizeObserverMock,
});
