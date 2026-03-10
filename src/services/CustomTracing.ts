import { context, trace, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";

const traceEndpoint = "/tracingapi/v1/traces";
const serviceName = "FlyFast-WebUI";

const resource = resourceFromAttributes({ "service.name": serviceName });
const collector = new OTLPTraceExporter({ url: traceEndpoint });

const spanProcessors =
  process.env.NODE_ENV === "production"
    ? [new BatchSpanProcessor(collector)]
    : [
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
        new SimpleSpanProcessor(collector),
      ];

const provider = new WebTracerProvider({ resource, spanProcessors });

provider.register({
  contextManager: new ZoneContextManager(),
});

export const customTracing = (name: string, funct: Promise<unknown>) => {
  const webTracerWithZone = provider.getTracer(serviceName);

  const singleSpan = webTracerWithZone.startSpan(name, {
    attributes: {
      "http.url": window.location.href,
      "http.scheme": window.location.protocol,
      "http.host": window.location.host,
      "http.target": window.location.pathname,
      "net.peer.name": window.location.hostname,
      "net.peer.port": window.location.port,
    },
    kind: SpanKind.CLIENT,
  });

  return context.with(trace.setSpan(context.active(), singleSpan), () => {
    funct
      .then(() => {
        trace.getSpan(context.active())?.addEvent(`${name} Completed`);
        singleSpan.setStatus({ code: SpanStatusCode.OK });
        singleSpan.end();
      })
      .catch((error) => {
        singleSpan.setStatus({ code: SpanStatusCode.ERROR });
        console.error(error);
        singleSpan.end();
      });
  });
};
