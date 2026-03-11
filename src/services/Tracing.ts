/**
 * Purpose: This file (Tracing.ts) supports the services area of the FlyFast booking workflow.
 */
import { resourceFromAttributes } from "@opentelemetry/resources";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import type { Tracer } from "@opentelemetry/api";

const Tracing = (): Tracer | null => {
  const traceEndpoint = "/tracingapi/v1/traces";
  const serviceName = "FlyFast-WebUI";

  try {
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

    const propagateTraceHeaderCorsUrls = [/.+/g];
    const ignoreUrls = [/d\.btttag\.com/];

    registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [
        new DocumentLoadInstrumentation(),
        new FetchInstrumentation({ propagateTraceHeaderCorsUrls }),
        new XMLHttpRequestInstrumentation({ propagateTraceHeaderCorsUrls, ignoreUrls }),
        new UserInteractionInstrumentation(),
      ],
    });

    return provider.getTracer(serviceName);
  } catch (error) {
    console.error("Error initializing tracing:", error);
    return null;
  }
};

export default Tracing;
