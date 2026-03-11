import airportsData from "@/components/Search/AirportsData.json";
import { airportTypeAhead, searchFlight, type Airport, type TripResult } from "@/services/Flight";
import { setCurrentRouteSpan } from "@/services/RouteTracing";
import type { Span } from "@opentelemetry/api";

interface AirportDataEntry {
  id: number;
  name: string;
  city: string;
  country: string;
  value: string;
  code: number;
}

const airportSource = airportsData as AirportDataEntry[];

const mockAirports: Airport[] = airportSource.slice(0, 3).map((airport) => ({
  code: airport.value,
  name: airport.name,
  city: airport.city,
  country: airport.country,
}));

const mockTripResult: TripResult[][] = [
  [
    {
      from: "CHP",
      to: "SIL",
      flights: [
        {
          flightNumber: "FF123",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T08:00:00Z",
          arrivalTime: "2024-07-01T12:00:00Z",
          from: "CHP",
          to: "SIL",
          seat: "Economy",
          fare: 199.99,
        },
      ],
      departureTime: "2024-07-01T08:00:00Z",
      arrivalTime: "2024-07-01T12:00:00Z",
      fare: 199.99,
    },
    {
      from: "CHP",
      to: "SIL",
      flights: [
        {
          flightNumber: "FF352",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T03:00:00Z",
          arrivalTime: "2024-07-01T05:00:00Z",
          from: "CHP",
          to: "VLM",
          seat: "Economy",
          fare: 40.99,
        },
        {
          flightNumber: "FF632",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-01T08:00:00Z",
          arrivalTime: "2024-07-01T10:00:00Z",
          from: "VLM",
          to: "SIL",
          seat: "Economy",
          fare: 50.99,
        },
      ],
      departureTime: "2024-07-01T03:00:00Z",
      arrivalTime: "2024-07-01T10:00:00Z",
      fare: 90.98,
    },
  ],
  [
    {
      from: "SIL",
      to: "CHP",
      flights: [
        {
          flightNumber: "FF124",
          airline: "FlyFast Airlines",
          departureTime: "2024-07-07T08:00:00Z",
          arrivalTime: "2024-07-07T12:00:00Z",
          from: "SIL",
          to: "CHP",
          seat: "Economy",
          fare: 189.99,
        },
      ],
      departureTime: "2024-07-07T08:00:00Z",
      arrivalTime: "2024-07-07T12:00:00Z",
      fare: 189.99,
    },
  ],
];

describe("Flight service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    setCurrentRouteSpan(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setCurrentRouteSpan(null);
  });

  it("returns round-trip destination and return results", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => mockTripResult,
    } as Response);

    const result = await searchFlight("CHP", "SIL", "2024-07-01", "2024-07-07", "Economy");

    expect(result).toEqual(mockTripResult);
    expect(result[0]).toHaveLength(2);
    expect(result[1]).toHaveLength(1);

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const query = calledUrl.split("?")[1];
    const params = new URLSearchParams(query);

    expect(calledUrl.startsWith("/flightsearchapi/searchflight?")).toBe(true);
    expect(params.get("from")).toBe("CHP");
    expect(params.get("to")).toBe("SIL");
    expect(params.get("departure")).toBe("2024-07-01");
    expect(params.get("return")).toBe("2024-07-07");
    expect(params.get("seat")).toBe("Economy");
  });

  it("omits return parameter for one-way searches", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => [mockTripResult[0]],
    } as Response);

    await searchFlight("CHP", "SIL", "2024-07-01", null, "Economy");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const query = calledUrl.split("?")[1];
    const params = new URLSearchParams(query);

    expect(params.has("return")).toBe(false);
  });

  it("defaults null inputs to empty query values", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => [],
    } as Response);

    await searchFlight(null, null, null, null, null);

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const query = calledUrl.split("?")[1];
    const params = new URLSearchParams(query);

    expect(params.get("from")).toBe("");
    expect(params.get("to")).toBe("");
    expect(params.get("departure")).toBe("");
    expect(params.get("seat")).toBe("");
  });

  it("propagates fetch errors during search", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(
      searchFlight("CHP", "SIL", "2024-07-01", "2024-07-07", "Economy")
    ).rejects.toThrow("network down");
  });

  it("throws on non-OK search response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({}),
    } as Response);

    await expect(
      searchFlight("CHP", "SIL", "2024-07-01", "2024-07-07", "Economy")
    ).rejects.toThrow("HTTP 500: Internal Server Error");
  });

  it("returns airports based on AirportsData-derived mock data", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => mockAirports,
    } as Response);

    const result = await airportTypeAhead("CH");

    expect(result).toEqual(mockAirports);
    expect(result[0].code).toBe("CHP");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const query = calledUrl.split("?")[1];
    const params = new URLSearchParams(query);
    expect(params.get("searchtxt")).toBe("CH");
  });

  it("returns empty list and skips fetch when text is null", async () => {
    const fetchMock = vi.mocked(fetch);

    const result = await airportTypeAhead(null);

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("adds limit parameter when provided", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => mockAirports,
    } as Response);

    await airportTypeAhead("CH", 5);

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const query = calledUrl.split("?")[1];
    const params = new URLSearchParams(query);
    expect(params.get("limit")).toBe("5");
  });

  it("throws on non-OK typeahead response", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ([]),
    } as Response);

    await expect(airportTypeAhead("CH")).rejects.toThrow("HTTP 404: Not Found");
  });

  it("uses parent context from active route span during searchFlight", async () => {
    const mockSpan: Span = {
      setAttribute: vi.fn(), setAttributes: vi.fn(),
      setStatus: vi.fn(), recordException: vi.fn(), end: vi.fn(),
    } as unknown as Span;
    setCurrentRouteSpan(mockSpan);

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200, statusText: "OK",
      json: async () => mockTripResult,
    } as Response);

    const result = await searchFlight("CHP", "SIL", "2024-07-01", null, "Economy");
    expect(result).toEqual(mockTripResult);
  });

  it("uses parent context from active route span during airportTypeAhead", async () => {
    const mockSpan: Span = {
      setAttribute: vi.fn(), setAttributes: vi.fn(),
      setStatus: vi.fn(), recordException: vi.fn(), end: vi.fn(),
    } as unknown as Span;
    setCurrentRouteSpan(mockSpan);

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200, statusText: "OK",
      json: async () => mockAirports,
    } as Response);

    const result = await airportTypeAhead("CH");
    expect(result).toEqual(mockAirports);
  });
});
