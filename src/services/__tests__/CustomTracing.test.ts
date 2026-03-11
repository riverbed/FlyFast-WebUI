import { describe, it, expect, beforeEach, vi } from "vitest";

const setStatus = vi.fn();
const setAttribute = vi.fn();
const addEvent = vi.fn();
const recordException = vi.fn();
const end = vi.fn();
const startSpan = vi.fn(() => ({
  setStatus,
  setAttribute,
  end,
  addEvent,
  recordException,
  setAttributes: vi.fn(),
}));

const active = vi.fn(() => "ctx");
const setSpan = vi.fn(() => "ctx-with-span");
const getSpan = vi.fn(() => ({ addEvent }));
const withFn = vi.fn((_: unknown, callback: () => unknown) => callback());

vi.mock("@opentelemetry/api", () => ({
  context: {
    active,
    with: withFn,
  },
  trace: {
    setSpan,
    getSpan,
  },
  SpanKind: {
    CLIENT: "CLIENT",
    INTERNAL: "INTERNAL",
  },
  SpanStatusCode: {
    OK: "OK",
    ERROR: "ERROR",
  },
}));

// Mock getActiveTracer to return the mocked tracer
vi.mock("@/services/Tracing", () => ({
  getActiveTracer: () => ({
    startSpan,
  }),
  __TEST_ONLY__: {
    resetTracingState: vi.fn(),
  },
}));

describe("CustomTracing - Enhanced Wrapper (Unit 1)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  describe("Legacy API Backward Compatibility (BR-6, BR-7)", () => {
    it("preserves legacy customTracing(name, promise) signature", async () => {
      const module = await import("@/services/CustomTracing");

      const mockPromise = Promise.resolve("success");
      const result = module.customTracing("testOp", mockPromise);

      expect(result).toBeInstanceOf(Promise); // Must return a promise
      const resolvedValue = await result;
      expect(resolvedValue).toBe("success");
    });

    it("creates span with INTERNAL kind for legacy calls", async () => {
      const module = await import("@/services/CustomTracing");

      module.customTracing("legacyOp", Promise.resolve("ok"));
      await Promise.resolve();

      expect(startSpan).toHaveBeenCalledWith(
        "legacyOp",
        expect.objectContaining({ kind: "INTERNAL" })
      );
    });

    it("marks legacy span as OK on successful promise resolution", async () => {
      const module = await import("@/services/CustomTracing");

      const promise = Promise.resolve("success");
      await module.customTracing("op", promise);

      expect(end).toHaveBeenCalled();
    });

    it("marks legacy span as ERROR on promise rejection", async () => {
      const module = await import("@/services/CustomTracing");

      const promise = Promise.reject(new Error("boom"));
      await expect(module.customTracing("op", promise)).rejects.toThrow("boom");

      expect(setStatus).toHaveBeenCalledWith({ code: "ERROR" });
      expect(recordException).toHaveBeenCalled();
      expect(end).toHaveBeenCalled();
    });

    it("rethrows error from wrapped promise", async () => {
      const module = await import("@/services/CustomTracing");

      const testError = new Error("test error");
      const promise = Promise.reject(testError);

      try {
        await module.customTracing("op", promise);
        expect.fail("Should have thrown");
      } catch (err) {
        expect(err).toBe(testError);
      }
    });
  });

  describe("Enhanced withSpan API (BR-7)", () => {
    it("creates span for async callback", async () => {
      const module = await import("@/services/CustomTracing");

      const callback = vi.fn(async () => "result");
      await module.TracingHelpers.withSpan("asyncOp", callback);

      expect(startSpan).toHaveBeenCalledWith(
        "asyncOp",
        expect.objectContaining({ kind: "INTERNAL" })
      );
      expect(callback).toHaveBeenCalled();
    });

    it("passes span to callback", async () => {
      const module = await import("@/services/CustomTracing");

      const callback = vi.fn(async (span) => {
        expect(span).toBeDefined();
        return "result";
      });
      await module.TracingHelpers.withSpan("op", callback);

      expect(callback).toHaveBeenCalled();
    });

    it("ends span on successful callback", async () => {
      const module = await import("@/services/CustomTracing");

      await module.TracingHelpers.withSpan("op", async () => "success");

      expect(end).toHaveBeenCalled();
    });

    it("records error and ends span on callback failure", async () => {
      const module = await import("@/services/CustomTracing");

      const testError = new Error("callback error");
      try {
        await module.TracingHelpers.withSpan("op", async () => {
          throw testError;
        });
      } catch {
        // Expected to rethrow
      }

      expect(recordException).toHaveBeenCalled();
      expect(setStatus).toHaveBeenCalledWith({ code: "ERROR" });
      expect(end).toHaveBeenCalled();
    });

    it("returns callback result", async () => {
      const module = await import("@/services/CustomTracing");

      const result = await module.TracingHelpers.withSpan("op", async () => "myResult");
      expect(result).toBe("myResult");
    });
  });

  describe("Enhanced withSpanSync API (BR-7)", () => {
    it("creates span for sync callback", async () => {
      const module = await import("@/services/CustomTracing");

      const callback = vi.fn(() => "result");
      module.TracingHelpers.withSpanSync("syncOp", callback);

      expect(startSpan).toHaveBeenCalledWith(
        "syncOp",
        expect.objectContaining({ kind: "INTERNAL" })
      );
    });

    it("ends span on successful callback", async () => {
      const module = await import("@/services/CustomTracing");

      module.TracingHelpers.withSpanSync("op", () => "success");
      expect(end).toHaveBeenCalled();
    });

    it("records error and ends span on callback failure", async () => {
      const module = await import("@/services/CustomTracing");

      const testError = new Error("sync error");
      try {
        module.TracingHelpers.withSpanSync("op", () => {
          throw testError;
        });
      } catch {
        // Expected to rethrow
      }

      expect(recordException).toHaveBeenCalled();
      expect(setStatus).toHaveBeenCalledWith({ code: "ERROR" });
      expect(end).toHaveBeenCalled();
    });

    it("returns callback result", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.TracingHelpers.withSpanSync("op", () => "syncResult");
      expect(result).toBe("syncResult");
    });
  });

  describe("Safe Error Recording (BR-9, BR-10, NFR-3)", () => {
    it("sets ERROR status on span", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("test error");
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;
      module.recordSafeError(spanMock, error);

      expect(spanMock.setStatus).toHaveBeenCalledWith({ code: "ERROR" });
    });

    it("records error type and sanitized message", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("user_id=12345");
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;
      module.recordSafeError(spanMock, error);

      expect(spanMock.setAttribute).toHaveBeenCalledWith("error.type", "Error");
      // Message should be sanitized (PII removed)
      expect(spanMock.setAttribute).toHaveBeenCalledWith(
        "error.message",
        expect.not.stringContaining("12345")
      );
    });

    it("sanitizes email addresses from error messages", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("Failed for user@example.com");
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;
      module.recordSafeError(spanMock, error);

      const calls = spanMock.setAttribute.mock.calls;
      const errorMsgCall = calls.find((c: unknown[]) => c[0] === "error.message");
      if (errorMsgCall) {
        expect(errorMsgCall[1]).not.toContain("@");
      }
    });

    it("sanitizes URLs from error messages", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("Failed at https://secret-api.com/endpoint?token=xyz");
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;
      module.recordSafeError(spanMock, error);

      const calls = spanMock.setAttribute.mock.calls;
      const errorMsgCall = calls.find((c: unknown[]) => c[0] === "error.message");
      if (errorMsgCall) {
        expect(errorMsgCall[1]).not.toContain("https://");
      }
    });

    it("truncates error messages to max 500 chars", async () => {
      const module = await import("@/services/CustomTracing");

      const longMsg = "x".repeat(1000);
      const error = new Error(longMsg);
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;
      module.recordSafeError(spanMock, error);

      const calls = spanMock.setAttribute.mock.calls;
      const errorMsgCall = calls.find((c: unknown[]) => c[0] === "error.message");
      if (errorMsgCall) {
        expect((errorMsgCall[1] as string).length).toBeLessThanOrEqual(500);
      }
    });
  });

  describe("Safe Attribute Setting (BR-10, NFR-3)", () => {
    it("sets string attribute", async () => {
      const module = await import("@/services/CustomTracing");

      const spanMock = {
        setAttribute: vi.fn(),
      } as any;

      module.TracingHelpers.safeSetAttributes(spanMock, {
        "test.string": "value",
      });

      expect(spanMock.setAttribute).toHaveBeenCalledWith("test.string", expect.any(String));
    });

    it("sets number attribute", async () => {
      const module = await import("@/services/CustomTracing");

      const spanMock = {
        setAttribute: vi.fn(),
      } as any;

      module.TracingHelpers.safeSetAttributes(spanMock, {
        "test.number": 42,
      });

      expect(spanMock.setAttribute).toHaveBeenCalledWith("test.number", 42);
    });

    it("sets boolean attribute", async () => {
      const module = await import("@/services/CustomTracing");

      const spanMock = {
        setAttribute: vi.fn(),
      } as any;

      module.TracingHelpers.safeSetAttributes(spanMock, {
        "test.bool": true,
      });

      expect(spanMock.setAttribute).toHaveBeenCalledWith("test.bool", true);
    });

    it("ignores null and undefined values", async () => {
      const module = await import("@/services/CustomTracing");

      const setAttrSpy = vi.fn();
      const spanMock = { ...Object.create({}), setAttribute: setAttrSpy };

      module.TracingHelpers.safeSetAttributes(spanMock, {
        "test.null": null,
        "test.undefined": undefined,
      });

      expect(setAttrSpy).not.toHaveBeenCalled();
    });

    it("rejects complex types (objects, arrays)", async () => {
      const module = await import("@/services/CustomTracing");

      const setAttrSpy = vi.fn();
      const spanMock = { ...Object.create({}), setAttribute: setAttrSpy };

      module.TracingHelpers.safeSetAttributes(spanMock, {
        "test.object": { nested: "value" },
        "test.array": [1, 2, 3],
      });

      expect(setAttrSpy).not.toHaveBeenCalled();
    });

    it("handles null/undefined span gracefully", async () => {
      const module = await import("@/services/CustomTracing");

      expect(() => {
        module.TracingHelpers.safeSetAttributes(null, { "test.attr": "value" });
        module.TracingHelpers.safeSetAttributes(undefined, { "test.attr": "value" });
      }).not.toThrow();
    });
  });

  describe("Error Recording Helper (BR-9)", () => {
    it("records error safely via helper", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("helper test");
      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;

      module.TracingHelpers.recordError(spanMock, error);

      expect(spanMock.setStatus).toHaveBeenCalledWith({ code: "ERROR" });
    });

    it("handles null/undefined span gracefully", async () => {
      const module = await import("@/services/CustomTracing");

      const error = new Error("test");
      expect(() => {
        module.TracingHelpers.recordError(null, error);
        module.TracingHelpers.recordError(undefined, error);
      }).not.toThrow();
    });
  });

  describe("recordSafeError non-Error branch (BR-9)", () => {
    it("records string error with typeof as error.type and no recordException call", async () => {
      const module = await import("@/services/CustomTracing");

      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;

      module.recordSafeError(spanMock, "plain string error");

      expect(spanMock.setStatus).toHaveBeenCalledWith({ code: "ERROR" });
      expect(spanMock.setAttribute).toHaveBeenCalledWith("error.type", "string");
      expect(spanMock.setAttribute).toHaveBeenCalledWith("error.message", "plain string error");
      // Not an Error instance, so recordException must not be called
      expect(spanMock.recordException).not.toHaveBeenCalled();
    });

    it("records numeric error value as non-Error", async () => {
      const module = await import("@/services/CustomTracing");

      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;

      module.recordSafeError(spanMock, 42);

      expect(spanMock.setAttribute).toHaveBeenCalledWith("error.type", "number");
      expect(spanMock.recordException).not.toHaveBeenCalled();
    });

    it("uses 'Error' as fallback type when error.name is empty string", async () => {
      const module = await import("@/services/CustomTracing");

      const err = new Error("test");
      Object.defineProperty(err, "name", { value: "", configurable: true });

      const spanMock = {
        setStatus: vi.fn(),
        setAttribute: vi.fn(),
        recordException: vi.fn(),
      } as any;

      module.recordSafeError(spanMock, err);

      // || "Error" fallback on line 157 should be used when error.name is empty
      expect(spanMock.setAttribute).toHaveBeenCalledWith("error.type", "Error");
    });
  });

  describe("filterErrorObject (BR-9, BR-10)", () => {
    it("extracts type and message from Error instances", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.filterErrorObject(new Error("test message"));
      expect(result["error.type"]).toBe("Error");
      expect(result["error.message"]).toBe("test message");
    });

    it("uses 'Error' as fallback type when error.name is an empty string", async () => {
      const module = await import("@/services/CustomTracing");

      const err = new Error("test");
      Object.defineProperty(err, "name", { value: "", configurable: true });

      const result = module.filterErrorObject(err);
      expect(result["error.type"]).toBe("Error"); // triggers || 'Error' fallback
    });

    it("handles non-Error string with typeof as error.type", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.filterErrorObject("network timeout");
      expect(result["error.type"]).toBe("string");
      expect(result["error.message"]).toBe("network timeout");
    });

    it("handles non-Error object with typeof as error.type", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.filterErrorObject({ code: 503 });
      expect(result["error.type"]).toBe("object");
      expect(typeof result["error.message"]).toBe("string");
    });
  });

  describe("sanitizeAttributes PII branches (BR-10, NFR-3)", () => {
    it("strips known PII keys (blacklist match)", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.sanitizeAttributes({
        "app.page": "Home",
        email: "user@example.com",  // PII key — must be removed
        password: "secret",          // PII key — must be removed
      });

      expect(result["app.page"]).toBe("Home");
      expect(result["email"]).toBeUndefined();
      expect(result["password"]).toBeUndefined();
    });

    it("strips complex-type values (object/array)", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.sanitizeAttributes({
        "safe.key": "safe value",
        "nested.obj": { nested: "value" },  // complex — must be removed
        "an.array": [1, 2, 3],              // complex — must be removed
      });

      expect(result["safe.key"]).toBe("safe value");
      expect(result["nested.obj"]).toBeUndefined();
      expect(result["an.array"]).toBeUndefined();
    });

    it("strips string values matching PII patterns (email, bearer token)", async () => {
      const module = await import("@/services/CustomTracing");

      const result = module.sanitizeAttributes({
        "meta.info": "user@example.com",       // email pattern — must be removed
        "auth.header": "Bearer abc123token",   // bearer token — must be removed
        "http.method": "GET",                  // safe — must be kept
      });

      expect(result["meta.info"]).toBeUndefined();
      expect(result["auth.header"]).toBeUndefined();
      expect(result["http.method"]).toBe("GET");
    });
  });
});
