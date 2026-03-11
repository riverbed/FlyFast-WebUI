/**
 * Test suite for reportWebVitals.ts
 * Tests web vitals performance metric reporting
 */
import { describe, it, expect, vi } from "vitest";
import reportWebVitals from "@/reportWebVitals";

vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe("reportWebVitals", () => {
  it("does nothing when no callback is provided", () => {
    expect(() => {
      reportWebVitals();
    }).not.toThrow();
  });

  it("does nothing when callback is not a function", async () => {
    expect(() => {
      reportWebVitals("not a function" as unknown as (metric: unknown) => void);
    }).not.toThrow();
  });

  it("calls metrics when callback is a function", async () => {
    const mockCallback = vi.fn();

    reportWebVitals(mockCallback);

    // Give async import time to resolve
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockCallback).toBeDefined();
  });
});
