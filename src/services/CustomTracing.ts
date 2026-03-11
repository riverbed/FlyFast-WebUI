/**
 * CustomTracing.ts - Enhanced Wrapper for Custom Tracing Operations
 * 
 * Purpose: Wraps Promise-based operations with OTel span lifecycle management
 * Implements:
 * - Backward-compatible legacy API (BR-6, BR-7)
 * - Enhanced new helper APIs for modern patterns
 * - Safe error recording with PII sanitization (BR-9, BR-10)
 * - Data hygiene at export time
 */

import { context, trace, SpanKind, SpanStatusCode } from "@opentelemetry/api";
import type { Span } from "@opentelemetry/api";
import { getActiveTracer } from "@/services/Tracing";

// ============================================================================
// PII SANITIZATION UTILITIES (BR-10, NFR-3)
// ============================================================================

/**
 * Sensitive keys that should not be recorded in spans.
 * Keys in this set are filtered out before span attribute setting.
 */
export const PII_KEY_BLACKLIST = new Set<string>([
  'userId', 'user_id', 'id',
  'sessionId', 'session_id',
  'bookingRef', 'booking_ref', 'bookingReference', 'booking_reference',
  'email', 'emailAddress', 'email_address',
  'phone', 'phoneNumber', 'phone_number',
  'password', 'pwd',
  'token', 'authToken', 'auth_token', 'accessToken', 'access_token', 'refreshToken', 'refresh_token',
  'apiKey', 'api_key',
  'creditCard', 'credit_card', 'cardNumber', 'card_number', 'cardCvv', 'card_cvv',
  'ssn', 'socialSecurityNumber', 'social_security_number',
  'dob', 'dateOfBirth', 'date_of_birth',
  'address', 'street', 'city', 'state', 'zip', 'postalCode', 'postal_code',
  'paymentMethod', 'payment_method',
  'bankAccount', 'bank_account',
  'personalInfo', 'personal_info',
  'passport', 'licenseNumber', 'license_number',
  'authorization', 'bearer', 'x-api-key',
]);

/**
 * Regex patterns to detect sensitive values (PII data).
 * Applied to attribute values to filter out PII even if key doesn't match.
 */
const PII_VALUE_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern (XXX-XX-XXXX)
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone pattern
  /\b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g, // Credit card pattern
  /Bearer\s+[a-zA-Z0-9._\-]+/gi, // Bearer tokens
  /jwt\s*[:=]\s*[a-zA-Z0-9._\-]+/gi, // JWT tokens
  /["']?authorization["']?\s*[:=]\s*["']?[a-zA-Z0-9._\-]+["']?/gi, // Authorization headers
];

/**
 * Checks if a value appears to contain PII based on pattern matching.
 * @param value - String value to check
 * @returns true if value matches PII patterns
 */
function containsSensitiveValue(value: string): boolean {
  return PII_VALUE_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Sanitizes an attributes object by removing PII-flagged keys and values.
 * Applied before passing attributes to span.setAttribute calls.
 * 
 * @param rawAttrs - Raw attributes object
 * @returns Filtered attributes object safe for recording
 */
export function sanitizeAttributes(rawAttrs: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  Object.entries(rawAttrs).forEach(([key, value]) => {
    // Reject if key is in blacklist (case-insensitive)
    if (PII_KEY_BLACKLIST.has(key) || PII_KEY_BLACKLIST.has(key.toLowerCase())) {
      return; // Skip this attribute
    }

    // Reject if value is a complex type (protect against nested PII)
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return; // Skip complex types
    }

    // Check value for PII patterns if string
    if (typeof value === 'string' && containsSensitiveValue(value)) {
      return; // Skip values matching PII patterns
    }

    // Safe to include
    sanitized[key] = value;
  });

  return sanitized;
}

/**
 * Filters an error object to remove sensitive information.
 * Extracts safe error properties and returns sanitized attributes.
 * 
 * @param error - Error object to filter
 * @returns Sanitized error attributes safe for recording
 */
export function filterErrorObject(error: unknown): Record<string, string> {
  const filtered: Record<string, string> = {};

  if (error instanceof Error) {
    filtered['error.type'] = error.name || 'Error';
    filtered['error.message'] = sanitizeErrorMessage(error.message);
    // Note: stack trace excluded to avoid file paths, line numbers, and PII
  } else {
    filtered['error.type'] = typeof error;
    filtered['error.message'] = sanitizeErrorMessage(String(error));
  }

  return filtered;
}

// Remove PII patterns from error messages
function sanitizeErrorMessage(msg: string): string {
  return msg
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "<email>") // Remove emails
    .replace(/https?:\/\/[^\s]+/g, "<url>") // Remove URLs
    .replace(/\b\d{10,}\b/g, "<auth>") // Remove large numbers (tokens)
    .replace(/user[_-]?id\s*[:=]\s*[^\s,]+/gi, "user_id=***") // Remove user IDs
    .substring(0, 500); // Absolute max length
}

// Type-safe attribute setting with safe value conversion
function setAttributeSafe(span: Span, key: string, value: unknown): void {
  if (value === null || value === undefined) {
    // Skip null/undefined—no-op for safe operation
    return;
  }

  // Only allow primitive types (string, number, boolean)
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    span.setAttribute(key, value);
  } else {
    // Reject complex types (objects, arrays) silently
    // This prevents accidental PII leakage from structured data
  }
}

// Record error safely with PII sanitization (BR-9, BR-10)
export function recordSafeError(span: Span, error: unknown): void {
  // Set error status at span level
  span.setStatus({
    code: SpanStatusCode.ERROR,
  });

  // Record sanitized error attributes
  if (error instanceof Error) {
    setAttributeSafe(span, "error.type", error.name || "Error");
    setAttributeSafe(span, "error.message", sanitizeErrorMessage(error.message));
    // NO stack trace (contains file paths, line numbers, PII)
  } else {
    setAttributeSafe(span, "error.type", typeof error);
    setAttributeSafe(span, "error.message", sanitizeErrorMessage(String(error)));
  }

  // Record exception with OTel (it handles additional sanitization)
  if (error instanceof Error) {
    span.recordException(error);
  }
}

// ============================================================================
// BACKWARD-COMPATIBLE LEGACY API (BR-6, BR-7)
// ============================================================================

/**
 * Legacy wrapper for Promise-based operations.
 * 
 * BR-6: Backward Compatibility - Preserves existing call semantics
 * BR-7: Progressive Enhancement - Can introduce new helpers without breaking this
 * 
 * Usage: await customTracing("operationName", myPromise)
 * 
 * @param name - Span name for this operation
 * @param operation - Promise to wrap with span lifecycle
 * @returns The original promise (caller can await it)
 */
export async function customTracing<T>(
  name: string,
  operation: Promise<T>,
): Promise<T> {
  const tracer = getActiveTracer();
  const span = tracer.startSpan(name, {
    kind: SpanKind.INTERNAL,
  });

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      async () => operation,
    );
    span.end();
    return result;
  } catch (error) {
    recordSafeError(span, error);
    span.end();
    throw error; // Rethrow—caller's responsibility to handle
  }
}

// ============================================================================
// ENHANCED HELPER APIS (BR-7, NEW FOR UNIT 1)
// ============================================================================

/**
 * Enhanced tracing helpers providing modern patterns for custom instrumentation.
 * 
 * These APIs are backward-compatible additions that don't affect legacy code.
 * Use these for new instrumentation in Units 2 and 3.
 */
export const TracingHelpers = {
  /**
   * Wrap an async callback with automatic span lifecycle management.
   * 
   * Usage:
   *   const result = await TracingHelpers.withSpan("operationName", async (span) => {
   *     span.setAttributes({ "custom.attr": "value" });
   *     return await myAsyncOperation();
   *   });
   * 
   * @param name - Span name
   * @param callback - Async function that receives the span
   * @returns The callback's return value
   */
  async withSpan<T>(
    name: string,
    callback: (span: Span) => Promise<T>,
  ): Promise<T> {
    const tracer = getActiveTracer();
    const span = tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
    });

    try {
      return await context.with(
        trace.setSpan(context.active(), span),
        async () => callback(span),
      );
    } catch (error) {
      recordSafeError(span, error);
      throw error;
    } finally {
      span.end();
    }
  },

  /**
   * Wrap a synchronous callback with automatic span lifecycle management.
   * 
   * Usage:
   *   const result = TracingHelpers.withSpanSync("operationName", (span) => {
   *     span.setAttributes({ "custom.attr": "value" });
   *     return myOperation();
   *   });
   * 
   * @param name - Span name
   * @param callback - Sync function that receives the span
   * @returns The callback's return value
   */
  withSpanSync<T>(
    name: string,
    callback: (span: Span) => T,
  ): T {
    const tracer = getActiveTracer();
    const span = tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
    });

    try {
      return context.with(
        trace.setSpan(context.active(), span),
        () => callback(span),
      );
    } catch (error) {
      recordSafeError(span, error);
      throw error;
    } finally {
      span.end();
    }
  },

  /**
   * Set attributes on a span safely, filtering null values and enforcing type safety.
   * 
   * Usage:
   *   TracingHelpers.safeSetAttributes(span, {
   *     "http.method": "GET",
   *     "http.status_code": 200,
   *     "duration_ms": 42.5,
   *   });
   * 
   * Rejects complex types (objects, arrays) silently to prevent PII leakage.
   * 
   * @param span - OTel span to set attributes on
   * @param attributes - Key-value pairs to set
   */
  safeSetAttributes(span: Span | null | undefined, attributes: Record<string, unknown>): void {
    if (!span) return; // No-op if span is falsy

    Object.entries(attributes).forEach(([key, value]) => {
      setAttributeSafe(span, key, value);
    });
  },

  /**
   * Record an error safely with sanitization.
   * 
   * Usage:
   *   try {
   *     await operation();
   *   } catch (error) {
   *     TracingHelpers.recordError(span, error);
   *   }
   * 
   * @param span - OTel span to record error on
   * @param error - Error to record
   */
  recordError(span: Span | null | undefined, error: unknown): void {
    if (!span) return; // No-op if span is falsy
    recordSafeError(span, error);
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export { setAttributeSafe };
