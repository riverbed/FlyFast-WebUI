// import { context, trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

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

registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': {
        clearTimingResources: true,
      },
    })
  ],
  tracerProvider: provider
})

// Custom Instrumentation
/*
const webTracerWithZone = provider.getTracer(serviceName);

export function traceSpan(name, funct) {
  const singleSpan = webTracerWithZone.startSpan(name);
  return context.with(trace.setSpan(context.active(), singleSpan), () => {
    funct().then((_data) => {
      trace.getSpan(context.active()).addEvent(`${name} completed`);
      singleSpan.end();
    });
  });
};
*/