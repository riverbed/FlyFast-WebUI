import { render, screen } from "@testing-library/react";

import Cart from "@/components/Cart/Cart";
import { CartContext, type CartContextValue } from "@/services/Context";

vi.mock("@/components/Cart/EmptyCart", () => ({
  default: () => <div data-testid="empty-cart-view" />,
}));

vi.mock("@/components/Cart/FlightDetails", () => ({
  default: () => <div data-testid="cart-flight-details" />,
}));

const contextValue = (cartLength: number): CartContextValue => ({
  cart: Array.from({ length: cartLength }, (_, i) => ({
    flightNumber: `FF${i}`,
    airline: "FlyFast",
    departureTime: "2024-07-01T08:00:00Z",
    arrivalTime: "2024-07-01T10:00:00Z",
    from: "CHP",
    to: "SIL",
    seat: "Economy",
    fare: 100,
  })),
  pastCart: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  purchaseCart: vi.fn(),
});

describe("Cart", () => {
  it("renders empty state for empty cart", () => {
    render(
      <CartContext.Provider value={contextValue(0)}>
        <Cart />
      </CartContext.Provider>
    );

    expect(screen.getByTestId("empty-cart-view")).toBeInTheDocument();
  });

  it("renders flight details for non-empty cart", () => {
    render(
      <CartContext.Provider value={contextValue(1)}>
        <Cart />
      </CartContext.Provider>
    );

    expect(screen.getByTestId("cart-flight-details")).toBeInTheDocument();
  });

  it("renders nothing without cart context", () => {
    const { container } = render(<Cart />);

    expect(container).toBeEmptyDOMElement();
  });
});
