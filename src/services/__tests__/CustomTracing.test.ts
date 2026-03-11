const setStatus = vi.fn();
const end = vi.fn();
const addEvent = vi.fn();
const startSpan = vi.fn(() => ({
  setStatus,
  end,
}));
const getTracer = vi.fn(() => ({
  startSpan,
}));
const register = vi.fn();

const active = vi.fn(() => "ctx");
const setSpan = vi.fn(() => "ctx-with-span");
const getSpan = vi.fn(() => ({ addEvent }));
const withFn = vi.fn((_: unknown, callback: () => unknown) => callback());

const webTracerProviderCtor = vi.fn(() => ({
  register,
  getTracer,
}));

const resourceFromAttributes = vi.fn(() => ({ service: "resource" }));
const otlpTraceExporterCtor = vi.fn();
const consoleSpanExporterCtor = vi.fn();
const simpleSpanProcessorCtor = vi.fn();
const batchSpanProcessorCtor = vi.fn();
const zoneContextManagerCtor = vi.fn();

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
  },
  SpanStatusCode: {
    OK: "OK",
    ERROR: "ERROR",
  },
}));

vi.mock("@opentelemetry/resources", () => ({
  resourceFromAttributes,
}));

vi.mock("@opentelemetry/sdk-trace-web", () => ({
  WebTracerProvider: webTracerProviderCtor,
}));

vi.mock("@opentelemetry/exporter-trace-otlp-http", () => ({
  OTLPTraceExporter: otlpTraceExporterCtor,
}));

vi.mock("@opentelemetry/sdk-trace-base", () => ({
  ConsoleSpanExporter: consoleSpanExporterCtor,
  SimpleSpanProcessor: simpleSpanProcessorCtor,
  BatchSpanProcessor: batchSpanProcessorCtor,
}));

vi.mock("@opentelemetry/context-zone", () => ({
  ZoneContextManager: zoneContextManagerCtor,
}));

describe("customTracing", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NODE_ENV = "development";
  });

  it("creates a span and marks it successful when wrapped promise resolves", async () => {
    const module = await import("@/services/CustomTracing");

    module.customTracing("searchFlights", Promise.resolve("ok"));
    await Promise.resolve();
    await Promise.resolve();

    expect(getTracer).toHaveBeenCalledTimes(1);
    expect(startSpan).toHaveBeenCalledWith(
      "searchFlights",
      expect.objectContaining({ kind: "CLIENT" })
    );
    expect(addEvent).toHaveBeenCalledWith("searchFlights Completed");
    expect(setStatus).toHaveBeenCalledWith({ code: "OK" });
    expect(end).toHaveBeenCalled();
  });

  it("marks span as error and ends it when wrapped promise rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const module = await import("@/services/CustomTracing");

    module.customTracing("searchFlights", Promise.reject(new Error("boom")));
    await Promise.resolve();
    await Promise.resolve();

    expect(setStatus).toHaveBeenCalledWith({ code: "ERROR" });
    expect(end).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("builds development span processors on module initialization", async () => {
    await import("@/services/CustomTracing");

    expect(simpleSpanProcessorCtor).toHaveBeenCalledTimes(2);
    expect(batchSpanProcessorCtor).not.toHaveBeenCalled();
    expect(register).toHaveBeenCalledTimes(1);
    expect(resourceFromAttributes).toHaveBeenCalledWith({ "service.name": "FlyFast-WebUI" });
  });

  it("builds production span processors on module initialization", async () => {
    process.env.NODE_ENV = "production";

    await import("@/services/CustomTracing");

    expect(batchSpanProcessorCtor).toHaveBeenCalledTimes(1);
    expect(simpleSpanProcessorCtor).not.toHaveBeenCalled();
  });
});
