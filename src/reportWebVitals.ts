/**
 * Purpose: This file (reportWebVitals.ts) supports the src area of the FlyFast booking workflow.
 * Enhanced: Web vitals metrics are injected as span attributes to the active route span.
 */
import { currentRouteSpan } from '@/services/RouteTracing';

type ReportHandler = (metric: unknown) => void;

/**
 * Maps web vital metric names to OpenTelemetry span attribute keys
 */
const webVitalAttributeMap: Record<string, string> = {
  CLS: 'web_vital.cls',
  FCP: 'web_vital.fcp',
  LCP: 'web_vital.lcp',
  INP: 'web_vital.inp',
  TTFB: 'web_vital.ttfb',
};

/**
 * Wraps onPerfEntry handler to inject web vitals into active route span
 */
const createWebVitalsHandler = (onPerfEntry?: ReportHandler): ReportHandler => {
  return (metric: unknown) => {
    // Inject web vital as span attribute if route span exists
    if (typeof metric === 'object' && metric !== null) {
      const metricObj = metric as Record<string, unknown>;
      const metricName = metricObj.name as string;
      const metricValue = metricObj.value as number;
      
      const attributeKey = webVitalAttributeMap[metricName];
      if (attributeKey && currentRouteSpan && typeof metricValue === 'number') {
        currentRouteSpan.setAttribute(attributeKey, metricValue);
      }
    }
    
    // Call original handler if provided
    if (onPerfEntry && onPerfEntry instanceof Function) {
      onPerfEntry(metric);
    }
  };
};

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry instanceof Function || !onPerfEntry) {
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onINP, onTTFB }) => {
      const handler = createWebVitalsHandler(onPerfEntry);
      onCLS(handler as Parameters<typeof onCLS>[0]);
      onFCP(handler as Parameters<typeof onFCP>[0]);
      onLCP(handler as Parameters<typeof onLCP>[0]);
      onINP(handler as Parameters<typeof onINP>[0]);
      onTTFB(handler as Parameters<typeof onTTFB>[0]);
    });
  }
};

export default reportWebVitals;
