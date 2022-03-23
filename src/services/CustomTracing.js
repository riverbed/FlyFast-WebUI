import { context, trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';

const traceEndpoint = '/v1/traces';
const serviceName = 'FlyFast-WebUI';

// Service name used to identify the instance
const resource = new Resource({ 'service.name': serviceName });
// The Collector in which we will be sending the data to
const collector = new CollectorTraceExporter({ url: traceEndpoint });

const provider = new WebTracerProvider({ resource });


if (process.env.NODE_ENV === 'production'){
  // Typically, the BatchSpanProcessor will be more suitable for production environments than the SimpleSpanProcessor.
  // Use the BatchSpanProcessor to export spans in batches in order to more efficiently use resources.
  provider.addSpanProcessor(new BatchSpanProcessor(collector));
}
else {
  // Sends the span to the console to view
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.addSpanProcessor(new SimpleSpanProcessor(collector));
}

// Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
provider.register({ 
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator()
});

// Custom Instrumentation. Make sure an async function is being called for optimal results.
export const customTracing = (name, funct) => {
  const webTracerWithZone = provider.getTracer(serviceName);

  const singleSpan = webTracerWithZone.startSpan(name, {
    attributes: {
      // Attributes from the HTTP trace semantic conventions
      // https://opentelemetry.io/docs/reference/specification/trace/semantic_conventions/http
      // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/semantic_conventions/http.md#http-client
      "http.url": window.location.href,
      "http.scheme": window.location.protocol,
      "http.host": window.location.host,
      "http.target": window.location.pathname,
      "net.peer.name": window.location.hostname,
      "net.peer.port": window.location.port
    },
    // This span describes a request to some remote service
    kind: SpanKind.CLIENT
  });

  return context.with(trace.setSpan(context.active(), singleSpan), () => {
    try {
      funct.then(() => {
        trace.getSpan(context.active()).addEvent(`${name} Completed`);
        singleSpan.setStatus({ code: SpanStatusCode.OK });
        singleSpan.end();
      });
    } catch (error) {
      singleSpan.setStatus({ code: SpanStatusCode.ERROR });
      console.error(error);
      singleSpan.end();
    }
  });
}