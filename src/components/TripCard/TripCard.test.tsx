import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import TripCard from "@/components/TripCard/TripCard";
import { CartContext, type CartContextValue } from "@/services/Context";

vi.mock("@/services/Functions", () => ({
  timeConversion: () => "Time",
  timeDifference: () => "2 Hours",
}));

vi.mock("@/components/TripCard/FlightDetails", () => ({
  default: () => <div data-testid="trip-card-flight-details" />,
}));

const flights = [
  {
    flightNumber: "FF123",
    airline: "FlyFast",
    departureTime: "2024-07-01T08:00:00Z",
    arrivalTime: "2024-07-01T10:00:00Z",
    from: "CHP",
    to: "SIL",
    seat: "Economy",
    fare: 100,
  },
];

const renderTripCard = (context: CartContextValue) =>
  render(
    <MantineProvider>
      <CartContext.Provider value={context}>
        <TripCard
          from="CHP"
          to="SIL"
          flights={flights}
          departureTime="2024-07-01T08:00:00Z"
          arrivalTime="2024-07-01T10:00:00Z"
          fare={199.99}
        />
      </CartContext.Provider>
    </MantineProvider>
  );

describe("TripCard", () => {
  it("adds flights to cart", () => {
    const context: CartContextValue = {
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderTripCard(context);
    fireEvent.click(screen.getByTestId("trip-card-add-to-cart-button"));

    expect(context.addToCart).toHaveBeenCalledWith(flights);
  });

  it("renders summary details", () => {
    const context: CartContextValue = {
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderTripCard(context);

    expect(screen.getByText("CHP - SIL")).toBeInTheDocument();
    expect(screen.getByText("Total Time: 2 Hours")).toBeInTheDocument();
    expect(screen.getByText("$199.99")).toBeInTheDocument();
  });

  it("toggles flight detail visibility state", () => {
    const context: CartContextValue = {
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderTripCard(context);

    const toggleButton = screen.getByTestId("trip-card-toggle-details-button");
    const before = toggleButton.innerHTML;
    fireEvent.click(toggleButton);

    expect(toggleButton.innerHTML).not.toBe(before);
    expect(screen.getByTestId("trip-card-flight-details")).toBeInTheDocument();
  });

  it("renders nothing without cart context", () => {
    render(
      <MantineProvider>
        <TripCard
          from="CHP"
          to="SIL"
          flights={flights}
          departureTime="2024-07-01T08:00:00Z"
          arrivalTime="2024-07-01T10:00:00Z"
          fare={199.99}
        />
      </MantineProvider>
    );

    expect(screen.queryByText("CHP - SIL")).toBeNull();
    expect(screen.queryByTestId("trip-card-add-to-cart-button")).toBeNull();
  });
});
