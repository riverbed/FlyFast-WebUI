import { fireEvent, render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import Checkout from "@/pages/Checkout/Checkout";
import { CartContext, type CartContextValue } from "@/services/Context";

vi.mock("@/components/Cart/Cart", () => ({
  default: () => <div data-testid="checkout-cart" />,
}));

vi.mock("@/components/Breakdown/Confirmation", () => ({
  default: () => <div data-testid="checkout-confirmation" />,
}));

vi.mock("@/components/Breakdown/Cost", () => ({
  default: ({ proceedButton }: { proceedButton: (e: React.MouseEvent<HTMLButtonElement>) => void }) => (
    <button data-testid="checkout-cost-proceed" onClick={proceedButton}>
      proceed
    </button>
  ),
}));

const renderCheckout = (value: CartContextValue | null) =>
  render(
    <MantineProvider>
      {value ? (
        <CartContext.Provider value={value}>
          <Checkout />
        </CartContext.Provider>
      ) : (
        <Checkout />
      )}
    </MantineProvider>
  );

describe("Checkout page", () => {
  it("renders no checkout step when cart context is unavailable", () => {
    renderCheckout(null);
    expect(screen.queryByText("Confirm Items In Cart")).toBeNull();
  });

  it("calls purchaseCart when proceeding", () => {
    const contextValue: CartContextValue = {
      cart: [],
      pastCart: [],
      addToCart: vi.fn(),
      removeFromCart: vi.fn(),
      purchaseCart: vi.fn(),
    };

    renderCheckout(contextValue);
    fireEvent.click(screen.getByTestId("checkout-cost-proceed"));

    expect(contextValue.purchaseCart).toHaveBeenCalledTimes(1);
  });
});
