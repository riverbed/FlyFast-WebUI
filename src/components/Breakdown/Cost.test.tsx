import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Cost from "@/components/Breakdown/Cost";
import { CartContext, type CartContextValue } from "@/services/Context";

const cartItem = {
  flightNumber: "FF123",
  airline: "FlyFast",
  departureTime: "2024-07-01T08:00:00Z",
  arrivalTime: "2024-07-01T10:00:00Z",
  from: "CHP",
  to: "SIL",
  seat: "Economy",
  fare: 100,
};

const withContext = (value: CartContextValue, proceedButton = vi.fn()) =>
  render(
    <MantineProvider>
      <CartContext.Provider value={value}>
        <Cost proceedButton={proceedButton} />
      </CartContext.Provider>
    </MantineProvider>
  );

describe("Cost", () => {
  it("disables proceed button for empty cart", () => {
    withContext({
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    });

    expect(screen.getByTestId("checkout-proceed-button")).toBeDisabled();
  });

  it("shows totals and calls proceed callback", () => {
    const proceedButton = vi.fn();

    withContext(
      {
        cart: [cartItem, cartItem],
        pastCart: [],
        addToCart: vi.fn(),
        removeFromCart: vi.fn(),
        purchaseCart: vi.fn(),
      },
      proceedButton
    );

    expect(screen.getByText("$200")).toBeInTheDocument();
    expect(screen.getByText("$17.5")).toBeInTheDocument();
    expect(screen.getByText("$217.5")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("checkout-proceed-button"));
    expect(proceedButton).toHaveBeenCalledTimes(1);
  });

  it("renders nothing without cart context", () => {
    render(
      <MantineProvider>
        <Cost proceedButton={vi.fn()} />
      </MantineProvider>
    );

    expect(screen.queryByText("Order Summary")).toBeNull();
    expect(screen.queryByTestId("checkout-proceed-button")).toBeNull();
  });
});
