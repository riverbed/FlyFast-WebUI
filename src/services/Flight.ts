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

export const searchFlight = async (
  from: string | null,
  to: string | null,
  departureDate: string | null,
  returnDate: string | null,
  seatType: string | null
): Promise<TripResult[][]> => {
  const endpoint = "/flightsearchapi/searchflight";
  const location = `?from=${from}&to=${to}`;
  const departureTime = `&departure=${departureDate}`;
  let returnTime = "";
  if (returnDate) {
    returnTime = `&return=${returnDate}`;
  }
  const seat = `&seat=${seatType}`;
  const URI = endpoint + location + departureTime + returnTime + seat;
  const response = await fetch(URI);
  return (await response.json()) as TripResult[][];
};

export const airportTypeAhead = async (
  text: string | null,
  limit?: number | null
): Promise<Airport[]> => {
  if (!text) {
    return [];
  }
  const endpoint = "/flightsearchapi/airportypeahead";
  const search = `?searchtxt=${text}`;
  let limitResult = "";
  if (limit) {
    limitResult = `&limit=${limit}`;
  }
  const URI = endpoint + search + limitResult;
  const response = await fetch(URI);
  return (await response.json()) as Airport[];
};
