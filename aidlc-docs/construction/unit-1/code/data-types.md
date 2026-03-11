# Unit 1 Data Types & Type Definitions

## Overview

This document defines the TypeScript type system for Unit 1 tracing core. All types are exported from their respective modules for use in Unit 2 and Unit 3.

---

## Core Type Hierarchy

### Initialization Result Types

\\\	ypescript
// From Tracing.ts
interface TracingInitResult {
  success: boolean;                  // true = active tracer, false = degraded
  tracer: Tracer;                    // Current tracer (no-op if degraded)
  provider?: WebTracerProvider;      // OTel provider instance (if success)
  reason?: string;                   // Failure reason string (if !success)
  diagnosticEvent?: DiagnosticEvent; // Diagnostic data (if !success)
}

interface DiagnosticEvent {
  timestamp: number;                 // ISO timestamp
  event: string;                     // Event type identifier
  detail?: string;                   // Sanitized detail message
}
\\\

**Type Guards**:
\\\	ypescript
function isInitialized(result: TracingInitResult): result is {
  success: true;
  tracer: Tracer;
  provider: WebTracerProvider;
} {
  return result.success === true;
}

// Usage
if (isInitialized(Tracing())) {
  console.log("Tracer active:", result.provider);
}
\\\

---

### Span & Tracer Interfaces (OpenTelemetry)

\\\	ypescript
// Re-exported from @opentelemetry/api
interface Span {
  setAttributes(attributes: Attributes): void;
  getSpanContext(): SpanContext;
  isRecording(): boolean;
  recordException(exception: Exception): void;
  end(endTime?: HrTime): void;
}

interface Attributes {
  [attributeKey: string]: AttributeValue;
}

type AttributeValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: TraceFlags;
  traceState?: TraceState;
}

interface Tracer {
  startSpan(
    name: string,
    options?: SpanOptions,
  ): Span;
  startActiveSpan<T>(
    name: string,
    callback: (span: Span) => T,
  ): T;
}

interface SpanOptions {
  attributes?: Attributes;
  startTime?: HrTime;
  links?: Link[];
  root?: boolean;
  isRecording?: boolean;
}

interface Link {
  context: SpanContext;
  attributes?: Attributes;
}
\\\

---

### Custom Tracing Helper Types

\\\	ypescript
// From CustomTracing.ts
interface SpanCallback<T> {
  (span: Span): Promise<T> | T;
}

interface AttributeValueMap {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | undefined;
}

interface ErrorContext {
  error: unknown;
  operation?: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}
\\\

---

### Provider & Exporter Types

\\\	ypescript
// From @opentelemetry/sdk-trace-web
interface WebTracerProvider {
  getTracer(
    name: string,
    version?: string,
    options?: TracerOptions,
  ): Tracer;
  addSpanProcessor(processor: SpanProcessor): this;
  forceFlush(timeoutMillis?: number): Promise<void>;
  shutdown(): Promise<void>;
}

interface SpanProcessor {
  onStart(
    span: Span,
    parentContext: Context,
  ): void;
  onEnd(span: ReadableSpan): void;
  forceFlush(timeoutMillis?: number): Promise<void>;
  shutdown(): Promise<void>;
}

interface BatchSpanProcessor extends SpanProcessor {
  // Batches spans before export (default batch = 512 spans or 5s)
}

interface BasicTracerProvider extends WebTracerProvider {
  // Simplest provider (no batching, immediate export)
}

interface OTLPExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void;
  shutdown(): Promise<void>;
}

type ExportResult = "Success" | "Failure";
\\\

---

## Context & Async Management Types

\\\	ypescript
// Async local storage for context propagation
interface Context {
  getValue(key: symbol): unknown;
  with<T>(key: symbol, value: unknown, fn: () => T): T;
}

interface ContextManager {
  active(): Context;
  with<T>(context: Context, fn: () => T): T;
  bind<T extends (...args: unknown[]) => unknown>(
    context: Context,
    target: T,
  ): T;
}

// Async context for maintaining span correlation
interface AsyncContextManager extends ContextManager {
  enable(): this;
  disable(): this;
}
\\\

---

## Error & Diagnostics Types

\\\	ypescript
interface ErrorRecord {
  type: string;                      // e.g., "Error", "TypeError", "TimeoutError"
  message: string;                   // Sanitized (no PII)
  stack?: string;                    // Not exported, only internal
  timestamp: number;                 // When error occurred
  context?: Record<string, unknown>; // Sanitized context
}

interface ExceptionEvent {
  exception: java.lang.Exception | Error;  // OpenTelemetry compatible
  time: number;                            // Timestamp
  escaped: boolean;                        // Whether exception propagated
}

interface DiagnosticData {
  phase: "initialization" | "operation" | "shutdown";
  timestamp: number;
  event: DiagnosticEvent;
  component: string;  // e.g., "Tracing", "CustomTracing"
}
\\\

---

## Instrumentation Configuration Types

\\\	ypescript
// Auto-instrumentation configurations
interface InstrumentationConfig {
  enabled: boolean;
  requestHook?: (span: Span, request: Request | XMLHttpRequest) => void;
  responseHook?: (span: Span, response: Response | ProgressEvent) => void;
  ignoreUrls?: (RegExp | string)[];
  attributeNames?: string[];
}

interface FetchInstrumentationConfig extends InstrumentationConfig {
  // Fetch API specific settings
}

interface XHRInstrumentationConfig extends InstrumentationConfig {
  // XMLHttpRequest specific settings
}

interface DocumentLoadInstrumentationConfig extends InstrumentationConfig {
  // Document load / navigation specific settings
}

interface UserInteractionInstrumentationConfig extends InstrumentationConfig {
  // User interaction (click, etc.) specific settings
}
\\\

---

## Testing & Introspection Types

\\\	ypescript
// From __TEST_ONLY__ namespace
type InitializationState = "uninitialized" | "initializing" | "initialized" | "degraded";

interface TestOnlyAPI {
  getInitializationState(): InitializationState;
  getInitializationCallCount(): number;
  getCachedProvider(): WebTracerProvider | null;
  getDiagnosticEvents(): DiagnosticEvent[];
  resetTracingState(): void;
}

// Test helper types
interface TracingAssertion {
  initialized: boolean;
  idempotent: boolean;
  callCount: number;
  diagnostics: DiagnosticEvent[];
}

interface SpanAssertion {
  name: string;
  status: "OK" | "ERROR" | "UNSET";
  attributes: Record<string, unknown>;
  events: Array<{ name: string; timestamp: number }>;
  error?: ErrorRecord;
}
\\\

---

## Legacy Type Compatibility

\\\	ypescript
// custumTracing signature (backward compatible)
type CustomTracingFn<T> = (
  name: string,
  operation: Promise<T>,
) => Promise<T>;

// Type compatibility with older call patterns
interface LegacyCustomTracing {
  (name: string, operation: Promise<any>): Promise<any>;
}
\\\

---

## Type Export Map

### Public Exports (Unit 1)

\\\	ypescript
// From src/services/Tracing.ts
export type TracingInitResult;
export type DiagnosticEvent;
export type InitializationState; // via __TEST_ONLY__

// From src/services/CustomTracing.ts
export type SpanCallback<T>;
export type AttributeValueMap;
export type ErrorContext;

// Re-exported from OpenTelemetry
export type { Span, Tracer, SpanContext } from "@opentelemetry/api";
export type { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
\\\

### Internal Exports (Unit 1 Only)

\\\	ypescript
// Not for external use yet
type InstrumentationConfig;
type SpanProcessor;
type Context;
\\\

---

## Type-Safe Attribute Setting Pattern

\\\	ypescript
// Recommended pattern for setting attributes safely
interface SafeAttributeOptions {
  allowNull?: boolean;          // Allow null values (default: false)
  sanitizeStrings?: boolean;    // Remove PII (default: true)
  validateUrls?: boolean;       // Validate URL format (default: true)
}

// Helper function signature
function setAttributeSafe(
  span: Span,
  key: string,
  value: AttributeValue | null | undefined,
  options?: SafeAttributeOptions,
): boolean {
  // Returns true if set successfully, false if rejected
}

// Usage pattern
const updated = setAttributeSafe(span, "api.endpoint", "/flights/search", {
  sanitizeStrings: true,
  validateUrls: false,
});

if (updated) {
  console.log("Attribute set");
} else {
  console.log("Attribute rejected or ignored");
}
\\\

---

## Type Distribution to Units

### Unit 1 (Owned)
- TracingInitResult
- DiagnosticEvent
- InitializationState
- SpanCallback
- AttributeValueMap
- ErrorContext

### Unit 2 (Consumes from Unit 1)
- Span
- Tracer
- SpanContext
- TracingInitResult (for integration setup)
- AttributeValueMap (for route instrumentation)

### Unit 3 (Extends Unit 2)
- All of Unit 2 + specialized types for business instrumentation
- ErrorContext (for error recording)
- SpanCallback (for business operation wrapping)

---

## Generic Type Patterns

### Promise-Based Operations

\\\	ypescript
// Generic pattern for async instrumentations
type WithSpan<T> = <Func extends (...args: any[]) => Promise<T>>(
  name: string,
  fn: Func,
  ...args: Parameters<Func>
) => ReturnType<Func>;

// Generic pattern for sync instrumentations
type WithSpanSync<T> = <Func extends (...args: any[]) => T>(
  name: string,
  fn: Func,
  ...args: Parameters<Func>
) => ReturnType<Func>;
\\\

---

## Reference Types (External Imports)

\\\	ypescript
// @opentelemetry/api
import type {
  Span,
  Tracer,
  SpanContext,
  SpanOptions,
  Context,
  ContextManager,
  Attributes,
  AttributeValue,
} from "@opentelemetry/api";

// @opentelemetry/sdk-trace-web
import type {
  WebTracerProvider,
  BasicTracerProvider,
  BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-web";

// @opentelemetry/exporter-trace-otlp-http
import type {
  OTLPExporter,
} from "@opentelemetry/exporter-trace-otlp-http";
\\\

---
