import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { MantineProvider } from "@mantine/core";

import SearchResults from "@/components/SearchResults/SearchResults";
import Checkout from "@/pages/Checkout/Checkout";
import { CartProvider } from "@/services/Context";
import type { TripResult } from "@/services/Flight";

const mockRoundTripResults: TripResult[][] = [
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

const renderSearchToCheckout = (results: TripResult[][]) =>
  render(
    <MantineProvider>
      <CartProvider>
        <MemoryRouter initialEntries={["/searchflight"]}>
          <Routes>
            <Route
              path="/searchflight"
              element={<SearchResults fromData="CHP" toData="SIL" results={results} />}
            />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </MantineProvider>
  );

describe("Search results to checkout integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds a trip to cart, navigates to checkout, and completes confirmation", async () => {
    renderSearchToCheckout(mockRoundTripResults);

    const addButtons = await screen.findAllByTestId("trip-card-add-to-cart-button");
    fireEvent.click(addButtons[0]);

    fireEvent.click(screen.getByText("Cart"));
    fireEvent.click(await screen.findByTestId("search-results-proceed-checkout-button"));

    expect(await screen.findByText("My Cart")).toBeInTheDocument();
    expect(screen.getByText("Order Summary")).toBeInTheDocument();

    const proceedButton = screen.getByTestId("checkout-proceed-button");
    expect(proceedButton).toBeEnabled();
    fireEvent.click(proceedButton);

    expect(await screen.findByText("Thank You For Choosing FlyFast!")).toBeInTheDocument();
  });

  it("shows no-results state and no return step for one-way result sets", async () => {
    renderSearchToCheckout([[]]);

    expect(await screen.findByText("Destination Flights")).toBeInTheDocument();
    expect(screen.queryByText("Return Flights")).not.toBeInTheDocument();
    expect(
      screen.getByText("There are currently no trips that goes from CHP to SIL.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cart"));
    const proceedButton = await screen.findByTestId("search-results-proceed-checkout-button");
    fireEvent.click(proceedButton);

    await waitFor(() => {
      expect(screen.getByText("My Cart")).toBeInTheDocument();
      expect(screen.getByTestId("checkout-proceed-button")).toBeDisabled();
    });
  });
});
