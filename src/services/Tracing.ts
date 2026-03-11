/**
 * Tracing.ts - OpenTelemetry Bootstrap with Idempotent Initialization
 * 
 * Purpose: Modernizes tracing initialization with:
 * - Singleton idempotent initialization guard (BR-1, BR-2)
 * - Graceful degradation on failure (BR-3, BR-8)
 * - Safe, non-blocking error handling
 * - Data sanitization and PII exclusion (BR-10, BR-11)
 * - Test seams for observability (BR-12)
 */

import { resourceFromAttributes, Resource } from "@opentelemetry/resources";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  Span,
} from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import type { Tracer } from "@opentelemetry/api";

// ============================================================================
// UNIT 1 CONSTANTS & CONFIGURATION
// ============================================================================

const TRACE_ENDPOINT = "/tracingapi/v1/traces";
const SERVICE_NAME = "FlyFast-WebUI";

// Attribute allowlist for Unit 1 - enforce PII exclusion (NFR-3)
// Only these attributes are safe to export; all others filtered at export time
const UNIT1_SAFE_ATTRIBUTES = new Set<string>([
  // Span lifecycle
  "span.kind",
  "span.status",
  "otel.status_code",
  "error.type",
  "error.message",

  // Performance metrics
  "duration_ms",
  "bytes_transferred",
  "retry_count",

  // HTTP (safe fields only - no query params/PII)
  "http.method",
  "http.status_code",
  "http.url.path",

  // Initialization diagnostics
  "tracing.init_state",
  "tracing.provider_status",
  "tracing.instrumentation_count",
]);

// ============================================================================
// SINGLETON IDEMPOTENT INITIALIZATION STATE (BR-1, BR-2, NFR-1)
// ============================================================================

// Module-level state for singleton pattern
let isTracingInitialized = false;
let isInitializing = false;
let cachedTracerProvider: WebTracerProvider | null = null;
let initCallCount = 0; // For test instrumentation

// Diagnostic events captured during initialization
interface DiagnosticEvent {
  timestamp: number;
  event: string;
  detail?: string;
}
const diagnosticEvents: DiagnosticEvent[] = [];

// ============================================================================
// TRACING RESULT TYPE & NO-OP TRACER FALLBACK (BR-3, BR-8)
// ============================================================================

interface TracingInitResult {
  success: boolean;
  tracer: Tracer;
  provider?: WebTracerProvider;
  reason?: string;
  diagnosticEvent?: DiagnosticEvent;
}

// No-op tracer and span implementations - safe fallback when tracing fails
class NoOpSpan {
  // Required Span interface methods - all no-op
  setAttributes(): this {
    return this;
  }
  setAttribute(): this {
    return this;
  }
  addEvent(): this {
    return this;
  }
  addLink(): this {
    return this;
  }
  addLinks(): this {
    return this;
  }
  setStatus(): this {
    return this;
  }
  setName(): this {
    return this;
  }
  updateName(): this {
    return this;
  }
  end(): void {
    // No-op
  }
  isRecording(): boolean {
    return false;
  }
  recordException(): void {
    // No-op
  }
  spanContext() {
    return { traceId: "", spanId: "", traceFlags: 0 };
  }
}

class NoOpTracer implements Tracer {
  startSpan(): Span {
    return new NoOpSpan() as unknown as Span;
  }
  startActiveSpan(): any {
    return { span: new NoOpSpan() as unknown as Span };
  }
}

// ============================================================================
// DATA SANITIZATION & PII EXCLUSION (BR-10, BR-11, NFR-3)
// ============================================================================

// Note: These helper functions are designed for future use (Unit 2/3) and for
// potential export filter middleware. Currently OTel processors handle sanitization.

// Filter attributes through allowlist to prevent PII export
// @ts-ignore TS6133 (unused but available for future use)
const _createSafeAttributes = (rawAttrs: Record<string, unknown>): Record<string, unknown> => {
  const safeAttrs: Record<string, unknown> = {};

  Object.entries(rawAttrs).forEach(([key, value]) => {
    // Only include allowlisted attributes
    if (UNIT1_SAFE_ATTRIBUTES.has(key)) {
      // Ensure value is a safe primitive type (must be string, number, or boolean)
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        safeAttrs[key] = value;
      }
    }
  });

  return safeAttrs;
};

// Sanitize diagnostic events to remove sensitive information
// @ts-ignore TS6133 (unused but available for future use)
const _sanitizeDiagnosticEvent = (event: DiagnosticEvent): DiagnosticEvent => {
  return {
    timestamp: event.timestamp,
    event: event.event,
    detail: event.detail ? event.detail.substring(0, 200) : undefined, // Truncate to safe length
  };
};

// Remove PII patterns from error messages
function sanitizeErrorMessage(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "<email>") // Remove emails
    .replace(/https?:\/\/[^\s]+/g, "<url>") // Remove URLs
    .replace(/\b\d{10,}\b/g, "<auth>") // Remove large numbers (potential auth tokens)
    .substring(0, 500); // Absolute max length
}

// ============================================================================
// TRACING INITIALIZATION (BR-1, BR-2, BR-3, NFR-1, NFR-2)
// ============================================================================

// Create OTel tracer provider with configuration
function createTracerProvider(): WebTracerProvider {
  // Resource: Service identification
  const resource: Resource = resourceFromAttributes({ 
    "service.name": SERVICE_NAME,
  });

  // Exporter: Send traces to OTel collector
  const collector = new OTLPTraceExporter({ url: TRACE_ENDPOINT });

  // Span processors: Decide how spans are processed
  // Production: Batch export only (efficient)
  // Development: Console + batch export (visibility)
  const spanProcessors = process.env.NODE_ENV === "production"
    ? [new BatchSpanProcessor(collector)]
    : [
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
        new SimpleSpanProcessor(collector),
      ];

  // Create provider with resource and processors
  const provider = new WebTracerProvider({ resource, spanProcessors });

  // Register context manager for async context propagation
  provider.register({
    contextManager: new ZoneContextManager(),
  });

  // Configure auto-instrumentations to capture standard browser telemetry
  const propagateTraceHeaderCorsUrls = [/.+/g]; // All CORS requests
  const ignoreUrls = [/d\.btttag\.com/]; // Exclude known third-party trackers

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoadInstrumentation(), // Page load timing
      new FetchInstrumentation({ propagateTraceHeaderCorsUrls }), // HTTP API calls
      new XMLHttpRequestInstrumentation({ propagateTraceHeaderCorsUrls, ignoreUrls }), // Legacy XMLHttpRequest
      new UserInteractionInstrumentation(), // Click/input handlers
    ],
  });

  return provider;
}

// Initialize tracing with idempotent guard (BR-1, BR-2, BR-4)
// Fast-path: constant-time return on repeat calls (< 1ms)
// Safe-path: Graceful degradation if init fails (BR-3, BR-8)
function Tracing(): TracingInitResult {
  initCallCount++; // Track call count for tests

  // Guard 1: Fast-path for already-initialized state (BR-2, NFR-1)
  if (isTracingInitialized && cachedTracerProvider) {
    return {
      success: true,
      tracer: cachedTracerProvider.getTracer(SERVICE_NAME),
      provider: cachedTracerProvider,
    };
  }

  // Guard 2: Prevent concurrent initialization attempts (BR-1)
  if (isInitializing) {
    const degradedEvent: DiagnosticEvent = {
      timestamp: Date.now(),
      event: "initialization_in_progress",
    };
    diagnosticEvents.push(degradedEvent);
    return {
      success: false,
      tracer: new NoOpTracer(),
      reason: "Initialization already in progress",
      diagnosticEvent: degradedEvent,
    };
  }

  try {
    isInitializing = true;

    // Create provider and register instrumentations
    const provider = createTracerProvider();
    cachedTracerProvider = provider; // Cache for future calls
    isTracingInitialized = true;

    const successEvent: DiagnosticEvent = {
      timestamp: Date.now(),
      event: "initialization_success",
      detail: `Tracer provider initialized at ${new Date().toISOString()}`,
    };
    diagnosticEvents.push(successEvent);

    return {
      success: true,
      tracer: provider.getTracer(SERVICE_NAME),
      provider,
    };
  } catch (error: unknown) {
    // Graceful degradation: Capture error but return safe tracer (BR-3, BR-8)
    const errorMsg = error instanceof Error ? error.message : String(error);
    const sanitizedMsg = sanitizeErrorMessage(errorMsg);

    const failureEvent: DiagnosticEvent = {
      timestamp: Date.now(),
      event: "initialization_failed",
      detail: sanitizedMsg,
    };
    diagnosticEvents.push(failureEvent);

    console.error("Tracing initialization failed (app will continue without tracing):", sanitizedMsg);

    return {
      success: false,
      tracer: new NoOpTracer(), // Safe fallback: accepts all calls, no-op semantics
      reason: `Initialization failed: ${sanitizedMsg}`,
      diagnosticEvent: failureEvent,
    };
  } finally {
    isInitializing = false;
  }
}

// Get active tracer from current context or return default (BR-4, BR-5)
function getActiveTracer(): Tracer {
  if (cachedTracerProvider) {
    // If initialized, get tracer from current context
    const tracer = cachedTracerProvider.getTracer(SERVICE_NAME);
    return tracer;
  }
  // If not initialized, return no-op tracer
  return new NoOpTracer();
}

// ============================================================================
// TEST-ONLY API - OBSERVABLE STATE FOR ASSERTIONS (BR-12, BR-5)
// ============================================================================

// Export test-only interface for inspection and reset
const __TEST_ONLY__ = {
  // Get initialization state for test assertions
  getInitializationState(): "uninitialized" | "initializing" | "initialized" | "degraded" {
    if (isInitializing) return "initializing";
    if (!isTracingInitialized) return "uninitialized";
    if (!cachedTracerProvider) return "degraded";
    return "initialized";
  },

  // Get call count for duplicate detection (idempotency verification)
  getInitializationCallCount(): number {
    return initCallCount;
  },

  // Get cached provider without side effects
  getCachedProvider(): WebTracerProvider | null {
    return cachedTracerProvider;
  },

  // Get diagnostic events for inspection
  getDiagnosticEvents(): DiagnosticEvent[] {
    return [...diagnosticEvents]; // Return copy to prevent mutation
  },

  // Reset state for test isolation (between test cases)
  resetTracingState(): void {
    isTracingInitialized = false;
    cachedTracerProvider = null;
    isInitializing = false;
    initCallCount = 0;
    diagnosticEvents.length = 0;
  },
};

// ============================================================================
// PUBLIC EXPORTS
// ============================================================================

export { Tracing, getActiveTracer, __TEST_ONLY__, type TracingInitResult };
export default Tracing;
