# Unit 1 Module Organization & Architecture

## Overview

This document describes the module structure, responsibilities, and interactions within Unit 1 tracing core. It provides guidance for code generation and serves as the architecture reference for Unit 2 & 3 integration.

---

## Module Dependency Diagram

\\\

                   Application Bootstrap                      
                   (App.tsx, index.tsx)                       

                     
                      Imports on startup
                     
         
          Tracing.ts              Initialization Provider
          (Init & Management)         - creates provider instance
           Tracing()                 - registers instrumentations
           getActiveTracer()         - returns singleton
           __TEST_ONLY__        
         
                     
                      (exports tracer)
                     
         
          CustomTracing.ts        Instrumentation Helpers
          (Operation Wrapping)        - wraps operations with spans
           customTracing()           - error recording
           TracingHelpers            - attribute management
           Safe utilities       
         
                     
                      (uses tracer)
                     
    
                                                   
     Fetch                        XHR               Other
 Instrumentation            Instrumentation      Instrumentations
 (@opentelemetry/         (@opentelemetry/     - DocumentLoad
  instrumentation-fetch)   instrumentation-xhr) - UserInteraction
\\\

---

## File Structure

\\\
src/
 services/
    Tracing.ts               Core initialization & context
    CustomTracing.ts         Operation wrapping utilities
    __tests__/
       Tracing.test.ts      Initialization tests
       CustomTracing.test.ts  Helper tests
    [other existing services]
 App.tsx                       Calls Tracing() on mount
 [other app components]

aidlc-docs/
 construction/
     unit-1/
         functional-design/
         nfr-requirements/
         nfr-design/
         code/
             api-contracts.md
             data-types.md
             module-organization.md (this file)
\\\

---

## Module 1: Tracing.ts (Initialization Provider)

### Responsibilities

1. **Singleton Provider Management**
   - Creates WebTracerProvider on first call
   - Returns cached instance on repeat calls
   - Guarantees idempotent behavior

2. **Auto-Instrumentation Registration**
   - Registers Fetch instrumentation
   - Registers XHR instrumentation
   - Registers DocumentLoad instrumentation
   - Registers UserInteraction instrumentation
   - All configurations use best-practice defaults

3. **Error Handling & Diagnostics**
   - Captures initialization failures
   - Records diagnostic events
   - Returns degraded mode tracer (no-op) on failure
   - Never throws (fail-safe guarantee)

4. **Context Management**
   - Configures async context manager
   - Ensures context propagation across async boundaries
   - Binds context to promise chains automatically

### Key Exports

\\\	ypescript
// Main initialization function
export default function Tracing(): TracingInitResult

// Active tracer accessor
export function getActiveTracer(): Tracer

// Testing utilities (private namespace)
export const __TEST_ONLY__: {
  getInitializationState(): InitializationState;
  getInitializationCallCount(): number;
  getCachedProvider(): WebTracerProvider | null;
  getDiagnosticEvents(): DiagnosticEvent[];
  resetTracingState(): void;
}
\\\

### Internal State

\\\	ypescript
// Module-level state (private)
let provider: WebTracerProvider | null = null;
let state: InitializationState = "uninitialized";
let callCount: number = 0;
let diagnosticEvents: DiagnosticEvent[] = [];
\\\

### Initialization Flow

\\\
Tracing() called
      
       State = "uninitialized"?
               YES
               
                State = "initializing"
               
                Create provider
               
                Register instrumentations
                        Fetch 
                        XHR 
                        DocumentLoad 
                        UserInteraction 
               
                Success?
                   YES
                    State = "initialized"
                        Return { success: true, tracer, provider }
               
                   NO
                    State = "degraded"
                        Record diagnostic event
                        Return { success: false, tracer: NO_OP, reason, diagnosticEvent }
               
                callCount += 1
      
       State != "uninitialized"?
              YES
              
               callCount += 1
              
               Return cached result
                   (success: true, tracer, provider)
                   Constant-time lookup (< 1ms)
\\\

---

## Module 2: CustomTracing.ts (Operation Wrapping)

### Responsibilities

1. **Legacy Operation Wrapping** (customTracing function)
   - Wraps promise-based operations with span
   - Preserves backward compatibility
   - Records operation timing
   - Handles errors without breaking app

2. **Modern Helper API** (TracingHelpers object)
   - Provides typed async/sync wrapping
   - Manages span lifecycle automatically
   - Safe attribute setting with validation
   - Consistent error recording

3. **Utility Functions**
   - Safe error recording (no PII)
   - Safe attribute setting (type validation)
   - PII sanitization patterns
   - Common operation patterns

### Key Exports

\\\	ypescript
// Legacy wrapper (backward compatible)
export async function customTracing<T>(
  name: string,
  operation: Promise<T>,
): Promise<T>

// Modern helpers
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
}

// Utilities
export function recordSafeError(span: Span, error: unknown): void;
export function setAttributeSafe(span: Span, key: string, value: unknown): void;
\\\

### customTracing Function Flow

\\\
customTracing(name, promise)
      
       Get active tracer
      
       Create span with name
      
       Await promise
          
           Success?
            YES
             Set span status = OK
             End span
             Return result
          
           Error?
             YES
              Record error to span
              Set span status = ERROR
              End span
              Rethrow error (caller responsible)
      
       Return modified promise

Benefits:
- Zero-breaking change to existing callsites
- Automatic span creation/end
- Error context preserved for debugging
- Compatible with all promise-based patterns
\\\

### TracingHelpers.withSpan Flow

\\\
TracingHelpers.withSpan(name, callback)
      
       Get active tracer
      
       Start span with name
      
       Call callback(span)
           Callback receives live span reference
      
       Await callback result
          
           Success?
            YES
             Set span status = OK
             End span
             Return result
          
           Error?
             YES
              Record error (via .recordException)
              Set span status = ERROR
              End span
              Rethrow error (caller responsible)
      
       Return result

Benefits:
- Callback has full span control
- Explicit error handling contract
- Clean async/await pattern
- Context-safe (no callback binding needed)
\\\

### Error Recording Flow (recordSafeError)

\\\
recordSafeError(span, error)
      
       Sanitize error
           Extract message
           Remove PII (emails, URLs, tokens)
           Remove stack trace (not exported)
           Extract error type
      
       Create ExceptionEvent
           exception: Error object
           time: current timestamp
           escaped: true (error propagated to caller)
      
       Store in span
           .recordException(event)
      
       Set span status
            status = ERROR

Result: Exportable error data (no PII, safe for logs/dashboards)
\\\

---

## Instrumentation Configuration

### Fetch Instrumentation

\\\	ypescript
// Configuration applied in Tracing.ts
new FetchInstrumentation({
  enabled: true,
  requestHook: (span, request) => {
    // Called before fetch is sent
    // Set custom attributes from request
  },
  responseHook: (span, response) => {
    // Called after response is received
    // Set custom attributes from response
  },
  ignoreUrls: [
    /health/,           // Exclude health checks
    /metrics/,          // Exclude metrics endpoints
  ],
})

// Imported auto span attributes
// - http.method
// - http.url
// - http.status_code
// - http.host
// - http.scheme
\\\

### XHR Instrumentation

\\\	ypescript
// Configuration applied in Tracing.ts
new XMLHttpRequestInstrumentation({
  enabled: true,
  requestHook: (span, xhr) => {
    // Called before xhr.send()
  },
  responseHook: (span, xhr) => {
    // Called after xhr completes
  },
  ignoreUrls: [
    /health/,
    /metrics/,
  ],
})

// Imported auto span attributes
// - http.method
// - http.url
// - http.status_code
\\\

### DocumentLoad Instrumentation

\\\	ypescript
// Configuration applied in Tracing.ts
new DocumentLoadInstrumentation({
  enabled: true,
})

// Auto-recorded metrics
// - document.interactive timestamp
// - DOMContentLoaded timing
// - page load complete timing
\\\

### UserInteraction Instrumentation

\\\	ypescript
// Configuration applied in Tracing.ts
new UserInteractionInstrumentation({
  enabled: true,
})

// Auto-recorded interactions
// - Click events
// - Change events
// - Input events (filtered for PII)
\\\

---

## Span Lifecycle Management

### Span Creation

\\\	ypescript
// Option 1: Direct creation (tracer.startSpan)
const span = tracer.startSpan("operationName", {
  attributes: {
    "operation.type": "flight_search",
    "operation.user_id": userId,
  }
});

// Option 2: Auto-management (TracingHelpers.withSpan)
await TracingHelpers.withSpan("operationName", async (span) => {
  span.setAttributes({
    "operation.type": "flight_search",
  });
  return await operation();
});
\\\

### Span Closure & Cleanup

\\\	ypescript
// Option 1: Manual closure (direct creation)
span.end();

// Option 2: Automatic closure (helpers)
// Automatically called at callback end

// Option 3: Automatic closure (legacy)
// Automatically called when promise resolves/rejects

// Critical: Span must be ended before processor batch export
// Default: 512 spans or 5 seconds (whichever comes first)
\\\

---

## Context Propagation

### Async Context Preservation

\\\
Promise Created (Context: active tracer span)
      
       Promise Awaited
          
           Context Manager Binds Context
               trace_id, span_id preserved
          
           Async Callback Executes
               Receives parent span context
          
           Child Spans Reference Parent
                Automatic parent-child relationship
      
       Promise Resolved/Rejected
            Context Cleaned up
\\\

### Context Access Pattern

\\\	ypescript
// Within an async operation (context bound)
const tracer = getActiveTracer();

// This tracer is bound to current async context
// Any spans created are children of parent span
const childSpan = tracer.startSpan("childOp");

// When childSpan ends, parent relationship is maintained
// Exportable as:
// Parent Span (trace_id: ABC, span_id: 123)
//    Child Span (trace_id: ABC, span_id: 456, parent_span_id: 123)
\\\

---

## Error Handling Strategy

### Initialization Phase

\\\
Goal: Never break app due to tracing failure

Tracing() Error
      
       Catch Error
      
       Create No-Op Tracer
      
       Record Diagnostic Event
           event: "initialization_failed"
           reason: "[stack trace head]"
           timestamp: now()
      
       Return Degraded Result
           success: false
           tracer: NO_OP (returns no-op spans)
           reason: "[error description]"
           diagnosticEvent: [recorded event]
      
       App Continues Normally
            All tracing calls are silent no-ops

Result: Telemetry disabled but app functional
\\\

### Operation Phase

\\\
Goal: Record errors but don't break app

Operation Error
      
       Error Caught (in span end handler)
      
       Sanitize Error
           Extract message
           Remove PII, stack
      
       Record to Span
           .recordException(error)
           Set status = ERROR
      
       End Span
      
       Rethrow Error
           Caller handles error normally
      
       App Continues
            Error context preserved in telemetry

Result: Error exported + app error handling executed
\\\

---

## Integration with Units 2 & 3

### Unit 1  Unit 2 Handoff

**Unit 1 Provides**:
-  Initialized WebTracerProvider
-  Active Tracer (via getActiveTracer)
-  Auto-instrumentations (Fetch, XHR, DocumentLoad, UserInteraction)
-  Async context propagation
-  TracingHelpers for operation wrapping
-  Error recording utilities

**Unit 2 Consumes**:
-  getActiveTracer() for route/component instrumentation
-  TracingHelpers.withSpan for async operations
-  NO provider initialization needed
-  NO additional instrumentation setup

**Unit 2 Adds**:
- Route-level span hierarchy (in Effects)
- Component-level instrumentation (in hooks)
- Business logic operation spans

### Unit 2  Unit 3 Handoff

**Unit 2 Provides**:
-  Route span context
-  Component instrumentation
-  Established span hierarchy

**Unit 3 Consumes**:
-  getActiveTracer() for business operations
-  TracingHelpers.withSpan for business logic
-  recordSafeError for business error handling

**Unit 3 Adds**:
- Flight service operation spans
- Search result processing spans
- Checkout flow spans
- Web vitals (custom metrics as span events)

---

## Testing Strategy

### Unit 1 Tests

\\\	ypescript
// Tests should verify
describe("Tracing (Module 1)", () => {
  beforeEach(() => {
    __TEST_ONLY__.resetTracingState(); // Isolation
  });

  describe("Singleton Pattern", () => {
    it("initializes only on first call", () => {
      Tracing();
      Tracing();
      expect(__TEST_ONLY__.getInitializationCallCount()).toBe(2);
      expect(__TEST_ONLY__.getInitializationState()).toBe("initialized");
    });

    it("returns cached provider on repeat calls", () => {
      const result1 = Tracing();
      const result2 = Tracing();
      expect(result1.provider).toBe(result2.provider);
    });
  });

  describe("Error Handling", () => {
    it("returns degraded on initialization failure", () => {
      // Mock provider creation failure
      const result = Tracing();
      // If fails: result.success === false
    });
  });

  describe("Instrumentation Registration", () => {
    it("registers all auto-instrumentations", () => {
      const result = Tracing();
      // Verify Fetch, XHR, DocumentLoad, UserInteraction registered
    });
  });

  describe("Context Propagation", () => {
    it("propagates context through async calls", async () => {
      const tracer = getActiveTracer();
      // Create parent span
      // Create child operation
      // Assert child span references parent
    });
  });
});

describe("CustomTracing (Module 2)", () => {
  describe("Legacy customTracing", () => {
    it("wraps promise with span", async () => {
      const result = await customTracing("op", Promise.resolve(42));
      expect(result).toBe(42);
    });

    it("handles errors without breaking app", async () => {
      const error = new Error("op failed");
      expect(
        customTracing("op", Promise.reject(error))
      ).rejects.toThrow("op failed");
    });
  });

  describe("TracingHelpers", () => {
    describe("withSpan", () => {
      it("calls callback with span", async () => {
        let spanReceived: Span | null = null;
        await TracingHelpers.withSpan("op", async (span) => {
          spanReceived = span;
        });
        expect(spanReceived).toBeTruthy();
      });

      it("auto-manages span lifecycle", async () => {
        // Verify span is ended after callback
      });
    });

    describe("safeSetAttributes", () => {
      it("accepts primitives", () => {
        TracingHelpers.safeSetAttributes(span, {
          "attr.string": "value",
          "attr.number": 42,
          "attr.bool": true,
        });
        // Verify attributes set
      });

      it("rejects complex types silently", () => {
        TracingHelpers.safeSetAttributes(span, {
          "attr.object": { nested: "value" }, // Rejected
        });
        // Verify object attribute not set
      });

      it("handles null/undefined gracefully", () => {
        TracingHelpers.safeSetAttributes(span, {
          "attr.null": null,     // Ignored
          "attr.undefined": undefined, // Ignored
        });
        // No-op, no errors
      });
    });

    describe("recordError", () => {
      it("sanitizes PII from error", () => {
        const error = new Error("Request to https://user@domain.com failed");
        TracingHelpers.recordError(span, error);
        // Verify URL is removed from exported error
      });
    });
  });
});
\\\

---

## Performance Characteristics

| Operation | Latency | Budget | Status |
|-----------|---------|--------|--------|
| Tracing() init | ~50-100ms | <200ms |  OK |
| Tracing() repeat | <1ms | <5ms |  OK |
| customTracing() | +Op | +5ms |  OK |
| withSpan() | +Op | +5ms |  OK |
| Span attribute set | ~0.05ms | <1ms |  OK |
| recordError() | ~0.1ms | <2ms |  OK |

---

## Summary

Unit 1 provides a solid, idempotent, and fail-safe tracing foundation:

- **Tracing.ts**: Initialization + context management (singleton pattern)
- **CustomTracing.ts**: Operation wrapping + utilities (no-breaking-change helpers)
- **Instrumentations**: Auto-registration of Fetch, XHR, DocumentLoad, UserInteraction
- **Error handling**: Never breaks app, always fails gracefully
- **Context propagation**: Automatic async context management
- **Backward compatible**: All existing patterns continue to work

Units 2 & 3 can build on this foundation without worrying about initialization, error handling, or context management.

---
