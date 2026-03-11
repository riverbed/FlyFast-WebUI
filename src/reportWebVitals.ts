/**
 * Purpose: This file (reportWebVitals.ts) supports the src area of the FlyFast booking workflow.
 */
type ReportHandler = (metric: unknown) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ onCLS, onFCP, onLCP, onINP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onINP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
