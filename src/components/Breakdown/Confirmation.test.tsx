import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Confirmation from "@/components/Breakdown/Confirmation";
import { CartContext, type CartContextValue } from "@/services/Context";

const mockFlightDetails = vi.fn();

vi.mock("@/components/Cart/FlightDetails", () => ({
  default: (props: unknown) => {
    mockFlightDetails(props);
    return <div data-testid="confirmation-flight-details" />;
  },
}));

const contextValue: CartContextValue = {
  cart: [],
  pastCart: [
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
  ],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  purchaseCart: vi.fn(),
};

describe("Confirmation", () => {
  it("renders order confirmation and passes past cart", () => {
    render(
      <MantineProvider>
        <CartContext.Provider value={contextValue}>
          <Confirmation />
        </CartContext.Provider>
      </MantineProvider>
    );

    expect(screen.getByText("Thank You For Choosing FlyFast!")).toBeInTheDocument();
    expect(screen.getByTestId("confirmation-flight-details")).toBeInTheDocument();

    const props = mockFlightDetails.mock.calls[0][0] as { cart: boolean; flights: unknown[] };
    expect(props.cart).toBe(false);
    expect(props.flights).toHaveLength(1);
  });

  it("renders nothing without cart context", () => {
    render(
      <MantineProvider>
        <Confirmation />
      </MantineProvider>
    );

    expect(screen.queryByText("Thank You For Choosing FlyFast!")).toBeNull();
    expect(screen.queryByTestId("confirmation-flight-details")).toBeNull();
  });
});
