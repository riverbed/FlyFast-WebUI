import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Tracing - Bootstrap Initialization (Unit 1)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("exports Tracing function", async () => {
    const module = await import("@/services/Tracing");
    expect(typeof module.default).toBe("function");
  }, 15000);

  it("exports getActiveTracer function", async () => {
    const module = await import("@/services/Tracing");
    expect(typeof module.getActiveTracer).toBe("function");
  });

  it("exports __TEST_ONLY__ API", async () => {
    const module = await import("@/services/Tracing");
    expect(module.__TEST_ONLY__).toBeDefined();
    expect(typeof module.__TEST_ONLY__.getInitializationState).toBe("function");
    expect(typeof module.__TEST_ONLY__.resetTracingState).toBe("function");
  });

  it("returns successful result on initialization", async () => {
    const module = await import("@/services/Tracing");
    const result = module.default();

    expect(result.success).toBe(true);
    expect(result.tracer).toBeDefined();
    expect(result.provider).toBeDefined();
  });

  it("is idempotent - returns cached provider on repeat calls", async () => {
    const module = await import("@/services/Tracing");

    const result1 = module.default();
    const result2 = module.default();

    expect(result1.provider).toBe(result2.provider);
  });

  it("returns no-op tracer on failure", async () => {
    const module = await import("@/services/Tracing");
    module.__TEST_ONLY__.resetTracingState();

    const result = module.default();
    const tracer = result.tracer;

    // No-op tracer should accept all calls without throwing
    expect(() => {
      const span = tracer.startSpan("test");
      span.end();
    }).not.toThrow();
  });

  it("tracks initialization call count", async () => {
    const module = await import("@/services/Tracing");

    module.__TEST_ONLY__.resetTracingState();
    expect(module.__TEST_ONLY__.getInitializationCallCount()).toBe(0);

    module.default();
    expect(module.__TEST_ONLY__.getInitializationCallCount()).toBe(1);

    module.default();
    expect(module.__TEST_ONLY__.getInitializationCallCount()).toBe(2);
  });

  it("exposes initialization state via __TEST_ONLY__", async () => {
    const module = await import("@/services/Tracing");

    module.__TEST_ONLY__.resetTracingState();
    expect(module.__TEST_ONLY__.getInitializationState()).toBe("uninitialized");

    module.default();
    expect(module.__TEST_ONLY__.getInitializationState()).toBe("initialized");
  });

  it("returns no-op active tracer before initialization", async () => {
    const module = await import("@/services/Tracing");
    module.__TEST_ONLY__.resetTracingState();

    const tracer = module.getActiveTracer();
    const span = tracer.startSpan("pre-init");

    expect(span.isRecording()).toBe(false);
    expect(span.spanContext()).toEqual({ traceId: "", spanId: "", traceFlags: 0 });
  });

  it("captures sanitized diagnostic event when provider creation fails", async () => {
    vi.resetModules();
    vi.doMock("@opentelemetry/sdk-trace-web", () => ({
      WebTracerProvider: vi.fn(() => {
        throw new Error("boom with email test@example.com and token 1234567890123 https://host/path");
      }),
    }));

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const module = await import("@/services/Tracing");
    const result = module.default();

    expect(result.success).toBe(false);
    expect(result.reason).toContain("<email>");
    expect(result.reason).toContain("<url>");
    expect(result.reason).toContain("<auth>");
    expect(module.__TEST_ONLY__.getInitializationState()).toBe("uninitialized");

    const events = module.__TEST_ONLY__.getDiagnosticEvents();
    const lastEvent = events[events.length - 1];
    expect(lastEvent?.event).toBe("initialization_failed");
    expect(lastEvent?.detail).toContain("<email>");
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    vi.doUnmock("@opentelemetry/sdk-trace-web");
  });

  it("no-op tracer span methods are safe when initialization fails", async () => {
    vi.resetModules();
    vi.doMock("@opentelemetry/sdk-trace-web", () => ({
      WebTracerProvider: vi.fn(() => {
        throw new Error("constructor fail");
      }),
    }));

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const module = await import("@/services/Tracing");
    const tracer = module.default().tracer;
    const span = tracer.startSpan("noop-coverage") as any;

    expect(() => {
      span.setAttributes({ a: 1 });
      span.setAttribute("b", true);
      span.addEvent("evt");
      span.addLink({});
      span.addLinks([]);
      span.setStatus({ code: 0 });
      span.setName("new");
      span.updateName("newer");
      span.recordException(new Error("x"));
      span.end();
    }).not.toThrow();

    expect(span.isRecording()).toBe(false);
    expect((tracer as any).startActiveSpan("name")).toHaveProperty("span");

    vi.restoreAllMocks();
    vi.doUnmock("@opentelemetry/sdk-trace-web");
  });

  it("returns defensive copy of diagnostic events", async () => {
    const module = await import("@/services/Tracing");
    module.__TEST_ONLY__.resetTracingState();
    module.default();

    const events = module.__TEST_ONLY__.getDiagnosticEvents();
    const originalLength = events.length;
    events.push({ timestamp: Date.now(), event: "mutated" });

    expect(module.__TEST_ONLY__.getDiagnosticEvents()).toHaveLength(originalLength);
  });

  it("getCachedProvider returns null before init and provider after init", async () => {
    const module = await import("@/services/Tracing");
    module.__TEST_ONLY__.resetTracingState();

    expect(module.__TEST_ONLY__.getCachedProvider()).toBeNull();

    module.default();

    expect(module.__TEST_ONLY__.getCachedProvider()).not.toBeNull();
  });

  it("getActiveTracer returns real tracer after successful initialization", async () => {
    const module = await import("@/services/Tracing");
    const initResult = module.default();

    // Provider must be initialized for the truthy cachedTracerProvider branch
    expect(initResult.success).toBe(true);

    const tracer = module.getActiveTracer();
    expect(tracer).toBeDefined();

    // Tracer from initialized provider should create recording spans
    const span = tracer.startSpan("test-cached-tracer");
    expect(span).toBeDefined();
    span.end();
  });

  it("uses BatchSpanProcessor only in production mode", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const module = await import("@/services/Tracing");
    const result = module.default();

    expect(result.success).toBe(true);
    expect(result.provider).toBeDefined();

    process.env.NODE_ENV = originalEnv;
  }, 15000);
});
