# Unit 1 API Contracts - Tracing Core Modernization

## Overview

This document defines the stable public API contracts for Unit 1 tracing bootstrap. These interfaces are designed to be read-only stable for Unit 2 instrumentation expansion.

---

## Module: src/services/Tracing.ts

### Primary Export: function Tracing()

\\\	ypescript
export function Tracing(): TracingInitResult {
  // Returns result object indicating initialization success/failure
}

interface TracingInitResult {
  success: boolean;                  // true: initialized, false: degraded
  tracer: Tracer;                    // Active tracer or no-op fallback
  provider?: WebTracerProvider;      // OTel provider (if success) or undefined
  reason?: string;                   // Failure reason (if !success)
  diagnosticEvent?: DiagnosticEvent; // Diagnostic info (if !success)
}

interface DiagnosticEvent {
  timestamp: number;                 // When event occurred
  event: string;                     // Event type (initialization_success, initialization_failed, etc.)
  detail?: string;                   // Sanitized detail message
}
\\\

**Semantics**:
- **Contract**: Idempotent initialization with singleton pattern
- **First call**: Initializes provider, registers instrumentations, returns success:true
- **Repeat calls**: Returns cached provider, success:true, constant-time (< 1ms)
- **Failure**: Returns no-op tracer (safe fallback), success:false, captures diagnostic event
- **Error handling**: Never throws; all failures handled gracefully

**Usage**:
\\\	ypescript
// Application bootstrap
import Tracing from "@/services/Tracing";
Tracing(); // Call once at startup (idempotent, safe to call multiple times)
\\\

---

### Secondary Export: function getActiveTracer()

\\\	ypescript
export function getActiveTracer(): Tracer {
  // Returns current tracer (active context-bound or default)
}
\\\

**Semantics**:
- Returns tracer bound to current async context
- If not initialized, returns no-op tracer
- Safe to call anytime (degradation-safe)

**Usage**:
\\\	ypescript
import { getActiveTracer } from "@/services/Tracing";
const tracer = getActiveTracer();
const span = tracer.startSpan("myOperation");
\\\

---

### Test Export: __TEST_ONLY__ namespace

\\\	ypescript
export const __TEST_ONLY__ = {
  getInitializationState(): "uninitialized" | "initializing" | "initialized" | "degraded",
  getInitializationCallCount(): number,
  getCachedProvider(): WebTracerProvider | null,
  getDiagnosticEvents(): DiagnosticEvent[],
  resetTracingState(): void,
};
\\\

**Semantics**:
- **getInitializationState()**: Returns current phase (for phase-based assertions)
- **getInitializationCallCount()**: Returns total call count (for idempotency verification)
- **getCachedProvider()**: Returns cached instance (for provider inspection)
- **getDiagnosticEvents()**: Returns event copy (for diagnostic inspection in tests)
- **resetTracingState()**: Clears all state (for test isolation)

**Usage**:
\\\	ypescript
import { __TEST_ONLY__ } from "@/services/Tracing";

beforeEach(() => {
  __TEST_ONLY__.resetTracingState(); // Clear state for test isolation
});

it("initializes idempotently", () => {
  Tracing();
  Tracing();
  expect(__TEST_ONLY__.getInitializationCallCount()).toBe(2);
  expect(__TEST_ONLY__.getInitializationState()).toBe("initialized");
});
\\\

---

## Module: src/services/CustomTracing.ts

### Legacy Export: function customTracing()

\\\	ypescript
export async function customTracing<T>(
  name: string,
  operation: Promise<T>,
): Promise<T> {
  // Wraps promise with span lifecycle
}
\\\

**Semantics**:
- Creates span around promise-based operation
- Returns original promise (caller can await)
- On success: Ends span OK status, preserves result
- On failure: Records error, ends span ERROR status, rethrows error
- Backward compatible: Existing callsites work unchanged

**Error Handling Contract**:
- Errors are rethrown to caller (caller responsible for handling)
- Error details recorded to span but not exposed
- App flow unaffected by tracing error

**Usage** (existing callsites):
\\\	ypescript
import { customTracing } from "@/services/CustomTracing";

const result = await customTracing("searchFlights", fetchFlights());
\\\

---

### Enhanced Export: TracingHelpers object

\\\	ypescript
export const TracingHelpers = {
  async withSpan<T>(
    name: string,
    callback: (span: Span) => Promise<T>,
  ): Promise<T>,

  withSpanSync<T>(
    name: string,
    callback: (span: Span) => T,
  ): T,

  safeSetAttributes(
    span: Span | null | undefined,
    attributes: Record<string, unknown>,
  ): void,

  recordError(
    span: Span | null | undefined,
    error: unknown,
  ): void,
};
\\\

**Semantics**:
- **withSpan**: Async wrappercallback receives span, ends automatically
- **withSpanSync**: Sync wrappersame pattern as withSpan but synchronous
- **safeSetAttributes**: Type-safefilters null/undefined, rejects complex types
- **recordError**: Safe error recordingsanitizes PII, sets error status

**Usage** (new code):
\\\	ypescript
import { TracingHelpers } from "@/services/CustomTracing";

// Async operation with explicit span
const result = await TracingHelpers.withSpan("myAsyncOp", async (span) => {
  span.setAttributes({ "custom.attr": "value" });
  return await myAsyncOperation();
});

// Sync operation
const syncResult = TracingHelpers.withSpanSync("mySyncOp", (span) => {
  TracingHelpers.safeSetAttributes(span, {
    "step": 1,
    "ready": true,
  });
  return performSync();
});

// Error recording
try {
  await operation();
} catch (error) {
  TracingHelpers.recordError(span, error);
}
\\\

---

### Utility Exports: Safe Error & Attribute Functions

\\\	ypescript
export function recordSafeError(span: Span, error: unknown): void;
export function setAttributeSafe(span: Span, key: string, value: unknown): void;
\\\

**Semantics**:
- **recordSafeError**: Records error without PII leakage
  - Sets ERROR status
  - Records error.type and sanitized error.message
  - No stack traces exported
  - PII patterns removed (emails, URLs, tokens)

- **setAttributeSafe**: Type-safe attribute setting
  - Primitives (string, number, boolean) only
  - Null/undefined ignored (no-op)
  - Complex types rejected silently

---

## Error Handling Contract

### Initialization Phase Errors
- Never propagate to app
- Returned as degraded result (success: false)
- No-op tracer returned (safe fallback)
- Logged to console + diagnostic event

### Operation Phase Errors
- Errors recorded to span
- Error status set, diagnostic captured
- Rethrown to caller (caller responsible for app-level handling)
- PII patterns stripped before export

### Guarantees
- Tracing errors never break app functionality
- Telemetry always safe for downstream systems (no PII)
- Attribute exportability guaranteed (allowlist enforced)

---

## Backward Compatibility Guarantees

### Protected Interfaces (Unit 1 -> Unit 2)
- **customTracing(name, promise)**: Function signature unchanged
- **Tracing() return**: Now returns TracingInitResult (not null); code calling Tracing() without checking return still works
- **Auto-instrumentations**: All active (Fetch, XHR, DocumentLoad, UserInteraction)
- **Context management**: Automatic async context propagation preserved

### Unit 2 Integration Notes
- Use getActiveTracer() to access current tracer
- Use TracingHelpers for new instrumentation patterns
- __TEST_ONLY__ API available for extended test coverage
- No initialization changes needed in Unit 2

---

## Performance Characteristics

| Operation | Latency | Notes |
|---|---|---|
| Tracing() - first call | ~50-100ms | Provider setup + instrumentation registration |
| Tracing() - repeat calls | < 1ms | Guard check + cached lookup |
| customTracing(name, op) | + Op latency | Minimal overhead (span creation ~0.1ms) |
| TracingHelpers.withSpan | + Op latency | Same overhead as customTracing |
| Span attribute set | ~0.05ms | Per-attribute |
| OTLP export | Batched | Default batch processor (512 spans or 5s) |

---

## Dependencies & Imports

\\\	ypescript
// Recommended imports
import Tracing, { getActiveTracer, __TEST_ONLY__ } from "@/services/Tracing";
import { customTracing, TracingHelpers } from "@/services/CustomTracing";

// For error handling
import { recordSafeError } from "@/services/CustomTracing";
\\\

---

## Future Extension Points (Unit 2 & 3)

1. **Route Tracing**: Use getActiveTracer() + TracingHelpers.withSpan in route effect hooks
2. **Web Vitals**: Emit web-vitals metrics as span events (extend allowlist for vitals attributes)
3. **Business Spans**: Use TracingHelpers for operation instrumentation (Flight service, etc.)
4. **Error Telemetry**: Use recordSafeError for consistent error handling across units
5. **Test Coverage**: Use __TEST_ONLY__ API for propagation and correlation validation

---
