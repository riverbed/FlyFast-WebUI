import { Resource } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter  } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';

// TODO: cleanup B3
// import { B3Propagator } from '@opentelemetry/propagator-b3';

const Tracing = () => {
  const traceEndpoint = '/tracingapi/v1/traces';
  const serviceName = 'FlyFast-WebUI';
  
  // Service name used to identify the instance
  const resource = new Resource({ 'service.name': serviceName });

  // The Collector in which we will be sending the data to
  const collector = new OTLPTraceExporter ({ url: traceEndpoint });
  
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
  // Use default W3C propagator (traceparent header) instead of B3 (b3 header)
  provider.register({ 
    contextManager: new ZoneContextManager(),
// TODO: cleanup B3
//    propagator: new B3Propagator()
  });
  
  // Passes trace headers to backend calls, gluing our frontend calls to the backend.
  const propagateTraceHeaderCorsUrls = [/.+/g,];

  // TODO: When UJI can ingest propagator field in the header (CORS + ingest), remove this temporary patch to workaround "Request header field b3 is not allowed by Access-Control-Allow-Headers in preflight response.)
  // Do not propagate the b3 field in the request head when sending ALLUVIO UJI beacon
  const ignoreUrls = [/d\.btttag\.com/];

  // Web Instrumentations can be found here: https://github.com/open-telemetry/opentelemetry-js-contrib#web-instrumentations
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({ propagateTraceHeaderCorsUrls }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls,
        ignoreUrls
      }),
      new UserInteractionInstrumentation(),
    ],
  });
  
  const tracer = provider.getTracer(serviceName);

  return tracer;
}

export default Tracing;
