import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Flight from "@/components/Flight/Flight";
import { CartContext, type CartContextValue } from "@/services/Context";

vi.mock("@/services/Functions", () => ({
  timeConversion: () => "Converted Time",
}));

const flight = {
  flightNumber: "FF123",
  airline: "FlyFast",
  departureTime: "2024-07-01T08:00:00Z",
  arrivalTime: "2024-07-01T10:00:00Z",
  from: "CHP",
  to: "SIL",
  seat: "Economy",
  fare: 199.99,
};

const renderFlight = (context: CartContextValue, addCart: boolean, cartMode = true) =>
  render(
    <MantineProvider>
      <CartContext.Provider value={context}>
        <Flight index={2} flight={flight} cart={cartMode} addCart={addCart} />
      </CartContext.Provider>
    </MantineProvider>
  );

describe("Flight component", () => {
  it("calls addToCart when add mode is active", () => {
    const context: CartContextValue = {
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderFlight(context, true);
    fireEvent.click(screen.getByTestId("flight-cart-toggle-button"));

    expect(context.addToCart).toHaveBeenCalledWith([flight]);
  });

  it("calls removeFromCart when remove mode is active", () => {
    const context: CartContextValue = {
      cart: [flight],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderFlight(context, false);
    fireEvent.click(screen.getByTestId("flight-cart-toggle-button"));

    expect(context.removeFromCart).toHaveBeenCalledWith(2);
  });

  it("hides cart toggle when cart mode is false", () => {
    const context: CartContextValue = {
      cart: [flight],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderFlight(context, true, false);
    expect(screen.queryByTestId("flight-cart-toggle-button")).toBeNull();
  });

  it("renders nothing without cart context", () => {
    render(
      <MantineProvider>
        <Flight index={2} flight={flight} cart={true} addCart={true} />
      </MantineProvider>
    );

    expect(screen.queryByText("FF123")).toBeNull();
    expect(screen.queryByTestId("flight-cart-toggle-button")).toBeNull();
  });
});
