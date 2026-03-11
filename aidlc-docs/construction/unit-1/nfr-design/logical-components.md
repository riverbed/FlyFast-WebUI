# Logical Components - Unit 1: Tracing Core Modernization

**Unit**: Unit 1 - Tracing Core Modernization  
**Phase**: CONSTRUCTION  
**Stage**: NFR Design  
**Date**: 2026-03-11  

---

## Executive Summary

This document defines the logical infrastructure components that Unit 1 establishes for tracing core modernization. These components include the OTel provider setup, instrumentation registry, context management, export pipeline, error handling, and test abstractions that form the foundation for Unit 2's instrumentation expansions.

---

## Component Architecture Overview

\\\

                    Application Runtime (Browser)                     

                                                                       
     
    React Application (src/ tree)                                 
    - Event Handlers                                              
    - Business Operations (Flight.ts, etc)                        
    - Page Navigation (App.tsx)                                   
     
                                                                    
                                                                    
     
     Unit 1: Tracing Core Bootstrap                             
         
     1. Initialization Guard (Idempotent Singleton)            
        - Protect against duplicate registration               
        - Cached provider accessor (< 1ms)                     
         
                                                                
                                                                
         
     2. Provider Setup (Create OTel Tracer Provider)           
        - @opentelemetry/sdk-trace-web                         
        - @opentelemetry/sdk-trace-base                        
        - Batch processor configuration                        
         
                                                                
                                                                
         
     3. Instrumentation Registry (Auto-Instrumentation)       
        - DocumentLoad detector                                
        - Fetch API interceptor                                
        - XMLHttpRequest interceptor                           
        - UserInteraction detector                             
         
                                                                
                                                                
         
     4. Context & Zone Management                              
        - AsyncLocalStorage-backed context                     
        - Automatic async context propagation                  
        - Explicit context bridges (React zones)               
         
                                                                
                                                                
         
     5. Custom Tracer Wrapper (Legacy + Enhanced APIs)         
        - customTracing(name, promise) ~ LEGACY kept           
        - TracingHelpers.withSpan ~ NEW async pattern          
        - TracingHelpers.withSpanSync ~ NEW sync pattern       
        - Safe attribute + error recording                     
         
                                                                
                                                                
         
     6. Error Handling & Degradation                           
        - Safe error recording (PII-filtered)                  
        - Diagnostic event emission                            
        - No-op fallback tracer                                
        - Graceful degradation on init failure                 
         
                                                                
                                                                
         
     7. Data Sanitization & Export Filtering                   
        - Attribute allowlist enforcement                      
        - PII pattern exclusion (emails, IDs, URLs)            
        - Export-time filtering (not app-time)                 
        - Safe diagnostics only (no stack traces)              
         
                                                                
                                                                
         
     8. OTel Export Pipeline (OTLP HTTP Batch)                 
        - @opentelemetry/exporter-trace-otlp-http              
        - Batch exporter (collect + send interval)             
        - Environment-sensitive configuration                  
        - Development: console + HTTP export                   
        - Production: HTTP batch only                          
         
     
                                                                   

                                             (Spans + Diagnostic Events)
                                            
                          
                            OTel Exporter (Batch)       
                            /tracingapi/v1/traces       
                            (HTTP POST)                 
                          
                                            
                                            
                          
                            Observability Collector     
                            (Jaeger, DataDog, etc)      
                          
\\\

---

## Component 1: Initialization Guard Component

**Purpose**: Protect against duplicate initialization and provide idempotent access to tracer provider

**Responsibility**: 
- Maintain singleton initialization state (module-level boolean)
- Return cached provider on repeated calls
- Serialize concurrent initialization attempts
- Provide degradation fallback on init failure

**Internal State**:
- \isTracingInitialized: boolean\ - Initialization completion flag
- \isInitializing: boolean\ - Concurrent init prevention flag
- \cachedTracerProvider: TracerProvider | null\ - Cached provider instance
- \initCallCount: number\ - For test instrumentation

**External Interface** (Tracing.ts):
- \export function Tracing(): TracingInitResult\
- Input: None
- Output: \{ success: boolean; tracer: Tracer; provider: TracerProvider; reason?: string }\
- Error handling: Never throws; returns degraded result on failure

**Key Invariants**:
- First call: Init guard check passes, provider created and cached
- Subsequent calls: Always take fast path (< 1ms), return cached provider
- Concurrent calls: Second call waits for first to complete
- Failed init: Returns no-op tracer, app continues

---

## Component 2: OTel Provider & Instrumentation Registry

**Purpose**: Set up tracer provider with auto-instrumentations for standard browser observability

**Responsibility**:
- Create TracerProvider from @opentelemetry/sdk-trace-web
- Register auto-instrumentations:
  - DocumentLoad (page load timing)
  - Fetch (HTTP API calls)
  - XMLHttpRequest (jQuery, legacy patterns)
  - UserInteraction (click/input handlers)
- Configure batch processor (collect 512 spans or 5s timeout)
- Mount context manager (AsyncLocalStorage-based)

**Configuration Sources**:
- Environment variables (\REACT_APP_OTEL_*\ namespace)
- Default fallbacks (always-on for Fetch/XHR)
- Exporter endpoint: \/tracingapi/v1/traces\ (relative URL)

**Key Invariants**:
- Instrumentations registered exactly once (guard prevents re-registration)
- Batch processor buffers spans and flushes on schedule
- Provider is thread-safe for concurrent span creation
- Context propagation automatic for await/promise chains

---

## Component 3: Custom Tracer Wrapper (Backward Compatibility + Enhancement)

**Purpose**: Provide span lifecycle management for Promise-based operations, supporting legacy callsites and new patterns

**Responsibility**:
- Preserve \customTracing(name: string, promise: Promise<T>): Promise<T>\ behavior
- Introduce enhanced helpers: \TracingHelpers.withSpan(name, callback)\
- Auto-start/end spans around operations
- Safe error recording (recordException + error status)
- Attribute + event hygiene (no PII)

**External Interface** (CustomTracing.ts):
- Legacy: \export function customTracing<T>(name: string, op: Promise<T>): Promise<T>\
- New: \export const TracingHelpers = { withSpan, withSpanSync, safeSetAttributes }\

**Error Handling**:
- Promise rejection  recordException(error) + setStatus(ERROR) + rethrow
- Init failure  uses no-op tracer (silent pass-through)
- Attribute setting  safe type conversion + filtering

---

## Component 4: Context & Zone Management  

**Purpose**: Ensure trace context flows across async boundaries and React event handling zones

**Responsibility**:
- Automatic context propagation (OTel's built-in AsyncLocalStorage)
- Explicit context bridges for known zone crossings (React events, setTimeout)
- Tracer accessor function to get active tracer in any context

**External Interface**:
- \getActiveTracer(): Tracer\ - Returns tracer bound to current async context
- \contextBridge<T>(callback): T\ - Cross-zone context binding (explicit)
- \withTraceContext(spanName, handler)\ - React event handler wrapper

**Key Invariants**:
- Automatic context: Works transparently for 95%+ of cases
- Explicit binding: Available for edge cases (event handlers, timers)
- Fallback: If context lost, returns app's default tracer
- No performance penalty: Context lookups are O(1)

---

## Component 5: Data Sanitization & Export Filtering

**Purpose**: Enforce "no PII in telemetry" requirement at export pipeline

**Responsibility**:
- Maintain UNIT1_SAFE_ATTRIBUTES allowlist
- Filter all span attributes before export
- Sanitize diagnostic events (remove stack traces, file paths)
- Block PII patterns: emails, authentication tokens, user IDs, URLs with query params

**External Interface**:
- \createSafeAttributes(rawAttrs): Record<string, any>\ - Filter and return safe attrs
- \sanitizeDiagnosticEvent(event): Record<string, any>\ - Filter diagnostic fields

**Allowlist Categories**:
- Span lifecycle: span.kind, span.status, otel.status_code
- Performance: duration_ms, bytes_transferred, retry_count
- HTTP (safe fields): http.method, http.status_code, http.url.path (no query string)
- Initialization: tracing.init_state, tracing.provider_status
- Error: error.type, error.message (PII patterns removed)

---

## Component 6: Testing Seams & Observability

**Purpose**: Expose internal state for test assertions and debugging

**Responsibility**:
- Provide \__TEST_ONLY__\ namespace with state getters
- Reset tracing state between tests (test isolation)
- Track diagnostic events for verification
- Expose initialization call count (duplicate detection)

**External Interface** (__TEST_ONLY__):
- \getInitializationState()\  'uninitialized' | 'initializing' | 'initialized' | 'degraded'
- \getInitializationCallCount()\  number
- \getCachedProvider()\  TracerProvider | null
- \getDiagnosticEvents()\  DiagnosticEvent[]
- \esetTracingState()\  void

**Usage Example** (Vitest):
\\\	ypescript
beforeEach(() => {
  __TEST_ONLY__.resetTracingState();  // Fresh state
});

it('idempotent init', () => {
  Tracing();
  Tracing();
  expect(__TEST_ONLY__.getInitializationCallCount()).toBe(2);
});

it('graceful degradation', () => {
  mockExporterFail();
  const result = Tracing();
  expect(result.success).toBe(false);
  expect(__TEST_ONLY__.getInitializationState()).toBe('degraded');
  expect(result.tracer).not.toBeNull();
});
\\\

---

## Component 7: Degradation & Error Handling

**Purpose**: Ensure app continues functioning even if tracing fails

**Responsibility**:
- Catch and handle initialization failures gracefully
- Return no-op tracing objects on failure
- Emit diagnostic events for observability
- Never throw exceptions that interrupt app flow

**Degradation Modes**:
- **initialization\_failed**: Provider setup failed (exporter unavailable, config invalid)
  - Result: No-op tracer, app continues with diagnostics logged
- **instrumentation\_failed**: Auto-instrumentation failed (e.g., Fetch API unavailable on unsupported browser)
  - Result: Continue with remaining instrumentations, degraded diagnostics
- **export\_failed**: OTLP endpoint unreachable
  - Result: Spans buffered in memory, no remote export (see batch processor max memory)

**No-Op Tracer Interface** (when degraded):
- \startSpan(name): Span\  Returns no-op span
- \span.end()\  No-op (instant return)
- \span.recordException(error)\  No-op
- \span.setStatus(status)\  No-op
- All methods safe to call, never throw

---

## Component Dependency Graph

\\\
Initialization Guard
    
     OTel Provider & Instrumentation Registry
             
              Context & Zone Management
                    
                            
        Custom Tracer        Data Sanitization
        Wrapper               & Export Filtering
                                   
             
                    
          OTel Exporter Pipeline
             (/tracingapi/v1/traces)
\\\

**Sequential Initialization Order**:
1. Guard check (fast return if already init)
2. Provider creation
3. Instrumentation registration
4. Context manager setup
5. Custom wrapper binding
6. Export pipeline ready
7. Degradation fallback available on any failure

---

## Integration Points for Unit 2

Unit 2 ("Instrumentation Expansion") will depend on these Unit 1 components:

| Component | Unit 2 Usage | Interface Dependency |
|-----------|--------------|---------------------|
| Init Guard | Bootstrap foundation | getActiveTracer() |
| Provider | Add route tracing | getTracerProvider() |
| Custom Wrapper | Business span helpers | TracingHelpers API |
| Context Mgmt | Preserve context across navigation | Automatic (no change needed) |
| Sanitization | Apply to new attributes | Same allowlist + extensions |
| Error Handling | Catch Unit 2 failures | Same degradation pattern |
| Testing Seams | Extended test coverage | Extended __TEST_ONLY__ API |

All Unit 1 components are **read-only stable** for Unit 2; no breaking changes expected.

---
