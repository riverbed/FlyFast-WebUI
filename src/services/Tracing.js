import { Resource } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { BaseOpenTelemetryComponent } from '@opentelemetry/plugin-react-load';

const Tracing = () => {
  const traceEndpoint = '/v1/traces';
  const serviceName = 'FlyFast-WebUI';
  
  // Service name used to identify the instance
  const resource = new Resource({ 'service.name': serviceName });
  // The Collector in which we will be sending the data to
  const collector = new CollectorTraceExporter({ url: traceEndpoint });
  
  const provider = new WebTracerProvider({ resource });
  provider.addSpanProcessor(new SimpleSpanProcessor(collector));
  // Sends the span to the console to view
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  
  // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
  provider.register({ 
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator()
  });
  
  // Web Instrumentations can be found here: https://github.com/open-telemetry/opentelemetry-js-contrib#web-instrumentations
  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation(),
      new XMLHttpRequestInstrumentation(),
    ],
  });
  
  const tracer = provider.getTracer(serviceName);
  BaseOpenTelemetryComponent.setTracer(serviceName);
  BaseOpenTelemetryComponent.setLogger(provider.logger);

  return tracer;
}

export default Tracing;