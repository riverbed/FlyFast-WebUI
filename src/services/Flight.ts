/**
 * Purpose: This file (Flight.ts) supports the services area of the FlyFast booking workflow.
 */
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
  return (await response.json()) as TripResult[][];
};

// Retrieves airport suggestions used by typeahead inputs.
export const airportTypeAhead = async (
  text: string | null,
  limit?: number | null
): Promise<Airport[]> => {
  if (!text) {
    return [];
  }

  const params = new URLSearchParams({ searchtxt: text });
  if (limit) {
    params.set("limit", String(limit));
  }

  const response = await fetch(`/flightsearchapi/airportypeahead?${params.toString()}`);
  return (await response.json()) as Airport[];
};
