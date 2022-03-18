import { Resource } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const traceEndpoint = '/v1/traces';
const serviceName = 'FlyFast-WebUI';

const resource = new Resource({ 'service.name': serviceName });
const collector = new CollectorTraceExporter({ url: traceEndpoint });

const provider = new WebTracerProvider({ resource });
provider.addSpanProcessor(new SimpleSpanProcessor(collector));

// Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
provider.register({ contextManager: new ZoneContextManager() });

const tracer = provider.getTracer(serviceName);

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation()
  ],
})

export function traceSpan(name, funct) {
  const singleSpan = tracer.startSpan(name);
  const functionCall = funct;
  singleSpan.end();
  return functionCall;
}