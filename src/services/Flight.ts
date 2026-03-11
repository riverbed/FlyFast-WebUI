/**
 * Purpose: This file (Flight.ts) supports the services area of the FlyFast booking workflow.
 * Enhanced: Flight search and airport typeahead operations are instrumented with child spans.
 */
import { context, trace, type Attributes } from '@opentelemetry/api';
import { getActiveTracer } from '@/services/Tracing';
import { currentRouteSpan } from '@/services/RouteTracing';
import { sanitizeAttributes, filterErrorObject } from '@/services/CustomTracing';

export interface FlightSegment {
  flightNumber: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  to: string;
  seat: string;
  fare: number;
}

export interface TripResult {
  from: string;
  to: string;
  flights: FlightSegment[];
  departureTime: string;
  arrivalTime: string;
  fare: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

// Requests flight options for a selected itinerary and returns grouped trip results.
export const searchFlight = async (
  from: string | null,
  to: string | null,
  departureDate: string | null,
  returnDate: string | null,
  seatType: string | null
): Promise<TripResult[][]> => {
  const tracer = getActiveTracer();
  const parentContext = currentRouteSpan ? trace.setSpan(context.active(), currentRouteSpan) : context.active();

  return context.with(parentContext, async () => {
    const span = tracer.startSpan('http.client.operation.search', {
      attributes: sanitizeAttributes({
        'http.method': 'GET',
        'http.url': '/flightsearchapi/searchflight',
        'operation.type': 'flight_search',
        'search.from': from ?? '(empty)',
        'search.to': to ?? '(empty)',
        'search.date': departureDate ?? '(empty)',
        'search.return_date': returnDate ?? '(empty)',
        'search.seat_type': seatType ?? '(empty)',
      }) as Attributes,
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const params = new URLSearchParams({
          from: from ?? "",
          to: to ?? "",
          departure: departureDate ?? "",
          seat: seatType ?? "",
        });

        if (returnDate) {
          params.set("return", returnDate);
        }

        const response = await fetch(`/flightsearchapi/searchflight?${params.toString()}`);
        span.setAttributes({
          'http.response.status_code': response.status,
        } as Attributes);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as TripResult[][];
        span.setStatus({ code: 0 });
        return result;
      } catch (err) {
        const errorAttrs = filterErrorObject(err as Error);
        span.setAttributes(errorAttrs as Attributes);
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
        throw err;
      } finally {
        span.end();
      }
    });
  }) as Promise<TripResult[][]>;
};

// Retrieves airport suggestions used by typeahead inputs.
export const airportTypeAhead = async (
  text: string | null,
  limit?: number | null
): Promise<Airport[]> => {
  if (!text) {
    return [];
  }

  const tracer = getActiveTracer();
  const parentContext = currentRouteSpan ? trace.setSpan(context.active(), currentRouteSpan) : context.active();

  return context.with(parentContext, async () => {
    const span = tracer.startSpan('http.client.operation.typeahead', {
      attributes: sanitizeAttributes({
        'http.method': 'GET',
        'http.url': '/flightsearchapi/airportypeahead',
        'operation.type': 'airport_typeahead',
        'search.text': text ?? '(empty)',
        'search.limit': limit ?? 10,
      }) as Attributes,
    });

    return context.with(trace.setSpan(context.active(), span), async () => {
      try {
        const params = new URLSearchParams({ searchtxt: text });
        if (limit) {
          params.set("limit", String(limit));
        }

        const response = await fetch(`/flightsearchapi/airportypeahead?${params.toString()}`);
        span.setAttributes({
          'http.response.status_code': response.status,
        } as Attributes);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as Airport[];
        span.setStatus({ code: 0 });
        return result;
      } catch (err) {
        const errorAttrs = filterErrorObject(err as Error);
        span.setAttributes(errorAttrs as Attributes);
        span.recordException(err as Error);
        span.setStatus({ code: 2 });
        throw err;
      } finally {
        span.end();
      }
    });
  }) as Promise<Airport[]>;
};
