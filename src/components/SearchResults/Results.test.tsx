import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Results from "@/components/SearchResults/Results";

vi.mock("@/components/SearchResults/NoResults", () => ({
  default: () => <div data-testid="no-results-view" />,
}));

vi.mock("@/components/TripCard/TripCard", () => ({
  default: ({ from, to }: { from: string; to: string }) => (
    <div data-testid="trip-card">{`${from}-${to}`}</div>
  ),
}));

describe("Results", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders no-results state when no trips are available", () => {
    render(
      <MantineProvider>
        <Results fromData="CHP" toData="SIL" resultsData={[]} />
      </MantineProvider>
    );

    expect(screen.getByTestId("no-results-view")).toBeInTheDocument();
  });

  it("renders paginated trip cards when results exist", () => {
    const trips = Array.from({ length: 11 }, () => ({
      from: "CHP",
      to: "SIL",
      flights: [],
      departureTime: "2024-07-01T08:00:00Z",
      arrivalTime: "2024-07-01T10:00:00Z",
      fare: 100,
    }));

    render(
      <MantineProvider>
        <Results fromData="CHP" toData="SIL" resultsData={trips} />
      </MantineProvider>
    );

    expect(screen.getAllByTestId("trip-card")).toHaveLength(10);
  });
});
