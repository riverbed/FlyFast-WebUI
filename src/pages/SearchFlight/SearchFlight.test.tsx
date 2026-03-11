import { render, screen, waitFor } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter, Route, Routes } from "react-router";

import SearchFlight from "@/pages/SearchFlight/SearchFlight";
import { searchFlight } from "@/services/Flight";

const mockSearchRender = vi.fn();
const mockSearchResultsRender = vi.fn();

vi.mock("@/services/Flight", () => ({
  searchFlight: vi.fn(),
}));

vi.mock("@/components/Search/Search", () => ({
  default: (props: unknown) => {
    mockSearchRender(props);
    return <div data-testid="search-mock" />;
  },
}));

vi.mock("@/components/SearchResults/SearchResults", () => ({
  default: (props: unknown) => {
    mockSearchResultsRender(props);
    return <div data-testid="search-results-mock" />;
  },
}));

const renderSearchFlightRoute = (route: string) =>
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/searchflight" element={<SearchFlight />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>
  );

describe("SearchFlight page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads flight results from query params and passes props to children", async () => {
    const mockResponse = [
      [
        {
          from: "CHP",
          to: "SIL",
          flights: [],
          departureTime: "2024-07-01T08:00:00Z",
          arrivalTime: "2024-07-01T12:00:00Z",
          fare: 199.99,
        },
      ],
      [],
    ];

    vi.mocked(searchFlight).mockResolvedValue(mockResponse as never);

    renderSearchFlightRoute(
      "/searchflight?from=CHP&to=SIL&departure=07-01-2024&return=07-07-2024&seat=Economy"
    );

    await waitFor(() => {
      expect(searchFlight).toHaveBeenCalledWith(
        "CHP",
        "SIL",
        "07-01-2024",
        "07-07-2024",
        "Economy"
      );
      expect(mockSearchRender).toHaveBeenCalled();
      expect(mockSearchResultsRender).toHaveBeenCalled();
    });

    const searchProps = mockSearchRender.mock.calls[0][0] as {
      fromData: string;
      toData: string;
      seatData: string;
      tripDateData: Array<string | null>;
    };
    expect(searchProps.fromData).toBe("CHP");
    expect(searchProps.toData).toBe("SIL");
    expect(searchProps.seatData).toBe("Economy");
    expect(searchProps.tripDateData).toEqual(["07-01-2024", "07-07-2024"]);

    const lastResultsCall =
      mockSearchResultsRender.mock.calls[mockSearchResultsRender.mock.calls.length - 1];
    const resultsProps = lastResultsCall?.[0] as {
      fromData: string;
      toData: string;
      results: unknown;
    };
    expect(resultsProps.fromData).toBe("CHP");
    expect(resultsProps.toData).toBe("SIL");
    expect(resultsProps.results).toEqual(mockResponse);

    expect(screen.getByTestId("search-mock")).toBeInTheDocument();
    expect(screen.getByTestId("search-results-mock")).toBeInTheDocument();
  });

  it("falls back to empty results when search request fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(searchFlight).mockRejectedValue(new Error("backend failed"));

    renderSearchFlightRoute("/searchflight?from=CHP&to=SIL&departure=07-01-2024&seat=Economy");

    await waitFor(() => {
      expect(searchFlight).toHaveBeenCalled();
      const lastResultsCall =
        mockSearchResultsRender.mock.calls[mockSearchResultsRender.mock.calls.length - 1];
      const resultsProps = lastResultsCall?.[0] as { results: unknown };
      expect(resultsProps.results).toEqual([[]]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  it("passes undefined and empty-string fallbacks when query params are missing", async () => {
    vi.mocked(searchFlight).mockResolvedValue([[]] as never);

    renderSearchFlightRoute("/searchflight");

    await waitFor(() => {
      expect(searchFlight).toHaveBeenCalledWith(null, null, null, null, null);
      expect(mockSearchRender).toHaveBeenCalled();
      expect(mockSearchResultsRender).toHaveBeenCalled();
    });

    const searchProps = mockSearchRender.mock.calls[0][0] as {
      fromData?: string;
      toData?: string;
      seatData?: string;
      tripDateData: Array<string | null>;
    };
    expect(searchProps.fromData).toBeUndefined();
    expect(searchProps.toData).toBeUndefined();
    expect(searchProps.seatData).toBeUndefined();
    expect(searchProps.tripDateData).toEqual([null, null]);

    const lastResultsCall =
      mockSearchResultsRender.mock.calls[mockSearchResultsRender.mock.calls.length - 1];
    const resultsProps = lastResultsCall?.[0] as {
      fromData: string;
      toData: string;
    };
    expect(resultsProps.fromData).toBe("");
    expect(resultsProps.toData).toBe("");
  });
});
