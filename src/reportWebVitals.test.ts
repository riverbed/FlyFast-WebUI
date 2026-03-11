/**
 * Test suite for reportWebVitals.ts
 * Tests web vitals performance metric reporting
 */
import { describe, it, expect, vi } from "vitest";
import reportWebVitals from "@/reportWebVitals";
import { setCurrentRouteSpan } from "@/services/RouteTracing";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

vi.mock("web-vitals", () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onTTFB: vi.fn(),
}));

describe("reportWebVitals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRouteSpan(null);
  });

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

    expect(onCLS).toHaveBeenCalled();
    expect(onFCP).toHaveBeenCalled();
    expect(onLCP).toHaveBeenCalled();
    expect(onINP).toHaveBeenCalled();
    expect(onTTFB).toHaveBeenCalled();
    expect(mockCallback).toBeDefined();
  });

  it("injects web vital metric into current route span", async () => {
    const setAttribute = vi.fn();
    setCurrentRouteSpan({ setAttribute } as unknown as Parameters<typeof setCurrentRouteSpan>[0]);

    reportWebVitals();
    await new Promise((resolve) => setTimeout(resolve, 30));

    const clsHandler = vi.mocked(onCLS).mock.calls[0]?.[0] as (metric: unknown) => void;
    clsHandler({ name: "CLS", value: 0.12 });

    expect(setAttribute).toHaveBeenCalledWith("web_vital.cls", 0.12);
  });

  it("forwards metric payload to callback and ignores unsupported metric payloads", async () => {
    const callback = vi.fn();
    const setAttribute = vi.fn();
    setCurrentRouteSpan({ setAttribute } as unknown as Parameters<typeof setCurrentRouteSpan>[0]);

    reportWebVitals(callback);
    await new Promise((resolve) => setTimeout(resolve, 30));

    const fcpHandler = vi.mocked(onFCP).mock.calls[0]?.[0] as (metric: unknown) => void;
    fcpHandler({ name: "FCP", value: "not-a-number" });
    fcpHandler({ name: "UNKNOWN", value: 33 });
    fcpHandler("invalid");

    expect(setAttribute).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(3);
  });
});
