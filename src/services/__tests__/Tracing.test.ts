import type { Mock } from "vitest";

const resourceFromAttributes = vi.fn();
const registerInstrumentations = vi.fn();

const providerRegister = vi.fn();
const providerGetTracer = vi.fn();
const webTracerProviderCtor = vi.fn(() => ({
  register: providerRegister,
  getTracer: providerGetTracer,
}));

const otlpTraceExporterCtor = vi.fn();
const consoleSpanExporterCtor = vi.fn();
const simpleSpanProcessorCtor = vi.fn();
const batchSpanProcessorCtor = vi.fn();
const zoneContextManagerCtor = vi.fn();
const documentLoadInstrumentationCtor = vi.fn();
const fetchInstrumentationCtor = vi.fn();
const xmlHttpRequestInstrumentationCtor = vi.fn();
const userInteractionInstrumentationCtor = vi.fn();

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

vi.mock("@opentelemetry/instrumentation", () => ({
  registerInstrumentations,
}));

vi.mock("@opentelemetry/instrumentation-document-load", () => ({
  DocumentLoadInstrumentation: documentLoadInstrumentationCtor,
}));

vi.mock("@opentelemetry/instrumentation-fetch", () => ({
  FetchInstrumentation: fetchInstrumentationCtor,
}));

vi.mock("@opentelemetry/instrumentation-xml-http-request", () => ({
  XMLHttpRequestInstrumentation: xmlHttpRequestInstrumentationCtor,
}));

vi.mock("@opentelemetry/instrumentation-user-interaction", () => ({
  UserInteractionInstrumentation: userInteractionInstrumentationCtor,
}));

describe("Tracing service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resourceFromAttributes.mockReturnValue({ service: "resource" });
    providerGetTracer.mockReturnValue({ tracer: "instance" });
  });

  it("uses simple span processors in non-production mode", async () => {
    process.env.NODE_ENV = "development";
    const module = await import("@/services/Tracing");

    const tracer = module.default();

    expect(tracer).toEqual({ tracer: "instance" });
    expect(simpleSpanProcessorCtor).toHaveBeenCalledTimes(2);
    expect(batchSpanProcessorCtor).not.toHaveBeenCalled();
    expect(registerInstrumentations).toHaveBeenCalledTimes(1);
    expect(providerRegister).toHaveBeenCalledTimes(1);
  });

  it("uses batch span processor in production mode", async () => {
    process.env.NODE_ENV = "production";
    const module = await import("@/services/Tracing");

    module.default();

    expect(batchSpanProcessorCtor).toHaveBeenCalledTimes(1);
    expect(simpleSpanProcessorCtor).not.toHaveBeenCalled();
  });

  it("returns null when initialization fails", async () => {
    process.env.NODE_ENV = "development";
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    resourceFromAttributes.mockImplementationOnce(() => {
      throw new Error("init error");
    });

    const module = await import("@/services/Tracing");
    const tracer = module.default();

    expect(tracer).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("registers fetch and xhr instrumentation with expected options", async () => {
    process.env.NODE_ENV = "development";
    const module = await import("@/services/Tracing");

    module.default();

    const fetchCtor = fetchInstrumentationCtor as Mock;
    const xhrCtor = xmlHttpRequestInstrumentationCtor as Mock;

    expect(fetchCtor).toHaveBeenCalledTimes(1);
    expect(xhrCtor).toHaveBeenCalledTimes(1);
    const fetchOptions = fetchCtor.mock.calls[0][0] as { propagateTraceHeaderCorsUrls: RegExp[] };
    const xhrOptions = xhrCtor.mock.calls[0][0] as {
      propagateTraceHeaderCorsUrls: RegExp[];
      ignoreUrls: RegExp[];
    };

    expect(fetchOptions.propagateTraceHeaderCorsUrls).toHaveLength(1);
    expect(xhrOptions.propagateTraceHeaderCorsUrls).toHaveLength(1);
    expect(xhrOptions.ignoreUrls).toHaveLength(1);
  });
});
