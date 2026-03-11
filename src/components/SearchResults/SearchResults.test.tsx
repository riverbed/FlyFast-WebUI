import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router";

import SearchResults from "@/components/SearchResults/SearchResults";

const mockResultsRender = vi.fn();

vi.mock("@/components/SearchResults/Results", () => ({
  default: (props: unknown) => {
    mockResultsRender(props);
    return <div data-testid="results-view" />;
  },
}));

vi.mock("@/components/Cart/Cart", () => ({
  default: () => <div data-testid="cart-view" />,
}));

describe("SearchResults", () => {
  beforeEach(() => {
    mockResultsRender.mockReset();
  });

  const renderWithResults = (results: unknown[][]) =>
    render(
      <MantineProvider>
        <MemoryRouter>
          <SearchResults fromData="CHP" toData="SIL" results={results as never} />
        </MemoryRouter>
      </MantineProvider>
    );

  it("shows destination and cart steps for one-way results", () => {
    renderWithResults([[{ from: "CHP", to: "SIL", flights: [], departureTime: "", arrivalTime: "", fare: 1 }]]);

    expect(screen.getByText("Destination Flights")).toBeInTheDocument();
    expect(screen.queryByText("Return Flights")).toBeNull();

    fireEvent.click(screen.getByText("Cart"));
    expect(screen.getByTestId("cart-view")).toBeInTheDocument();
  });

  it("shows return step for round-trip results", () => {
    renderWithResults([
      [{ from: "CHP", to: "SIL", flights: [], departureTime: "", arrivalTime: "", fare: 1 }],
      [{ from: "SIL", to: "CHP", flights: [], departureTime: "", arrivalTime: "", fare: 1 }],
    ]);

    expect(screen.getByText("Return Flights")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cart"));
    expect(screen.getByTestId("search-results-proceed-checkout-button")).toBeInTheDocument();
  });

  it("falls back to empty destination results when no result groups exist", () => {
    renderWithResults([]);

    const firstResultsProps = mockResultsRender.mock.calls[0][0] as { resultsData: unknown[] };
    expect(firstResultsProps.resultsData).toEqual([]);
  });

  it("falls back to empty return results when the second result group is missing", () => {
    renderWithResults([
      [{ from: "CHP", to: "SIL", flights: [], departureTime: "", arrivalTime: "", fare: 1 }],
      undefined as unknown as unknown[],
    ]);

    fireEvent.click(screen.getByText("Return Flights"));

    const lastRenderCall = mockResultsRender.mock.calls[mockResultsRender.mock.calls.length - 1];
    const returnResultsProps = lastRenderCall?.[0] as { resultsData: unknown[] };
    expect(returnResultsProps.resultsData).toEqual([]);
  });
});
