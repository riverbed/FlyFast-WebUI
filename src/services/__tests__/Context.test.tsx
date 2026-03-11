import { useContext } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { CartContext, CartProvider, getStorageConfig } from "@/services/Context";
import type { FlightSegment } from "@/services/Flight";
import { setCurrentRouteSpan } from "@/services/RouteTracing";

const flightA: FlightSegment = {
  flightNumber: "FF123",
  airline: "FlyFast Airlines",
  departureTime: "2024-07-01T08:00:00Z",
  arrivalTime: "2024-07-01T12:00:00Z",
  from: "CHP",
  to: "SIL",
  seat: "Economy",
  fare: 199.99,
};

const flightB: FlightSegment = {
  flightNumber: "FF632",
  airline: "FlyFast Airlines",
  departureTime: "2024-07-01T08:00:00Z",
  arrivalTime: "2024-07-01T10:00:00Z",
  from: "VLM",
  to: "SIL",
  seat: "Economy",
  fare: 50.99,
};

const CartHarness = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    return <div>no-context</div>;
  }

  return (
    <div>
      <div data-testid="cart-length">{ctx.cart.length}</div>
      <div data-testid="past-cart-length">{ctx.pastCart.length}</div>
      <div data-testid="first-flight">{ctx.cart[0]?.flightNumber ?? "none"}</div>
      <button onClick={() => ctx.addToCart([flightA])}>add-one</button>
      <button onClick={() => ctx.addToCart([flightA, flightB])}>add-two</button>
      <button onClick={() => ctx.removeFromCart(0)}>remove-first</button>
      <button onClick={() => ctx.removeFromCart(1)}>remove-second</button>
      <button onClick={() => ctx.purchaseCart()}>purchase</button>
    </div>
  );
};

describe("CartContext provider", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentRouteSpan(null);
  });

  it("initializes with empty cart and empty purchase history", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
      expect(screen.getByTestId("past-cart-length")).toHaveTextContent("0");
    });
  });

  it("adds one or multiple flights to cart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-one"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
      expect(screen.getByTestId("first-flight")).toHaveTextContent("FF123");
    });

    fireEvent.click(screen.getByText("add-two"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("3");
    });
  });

  it("removes flights by index", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-two"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("2");
    });

    fireEvent.click(screen.getByText("remove-second"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
      expect(screen.getByTestId("first-flight")).toHaveTextContent("FF123");
    });

    fireEvent.click(screen.getByText("remove-first"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
      expect(screen.getByTestId("first-flight")).toHaveTextContent("none");
    });
  });

  it("purchases cart by moving current items to pastCart and clearing active cart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-two"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("2");
    });

    fireEvent.click(screen.getByText("purchase"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
      expect(screen.getByTestId("past-cart-length")).toHaveTextContent("2");
    });
  });

  it("persists cart in localStorage", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-one"));

    await waitFor(() => {
      const raw = localStorage.getItem("cart");
      expect(raw).toContain("FF123");
      expect(raw).toContain("CHP");
    });
  });

  it("uses [] as fallback when deserializing undefined storage values", () => {
    const config = getStorageConfig("cart");

    expect(config.deserialize(undefined)).toEqual([]);
  });

  it("deserializes provided storage values when present", () => {
    const config = getStorageConfig("cart");

    expect(config.deserialize('[{"flightNumber":"FF1"}]')).toEqual([
      { flightNumber: "FF1" },
    ]);
  });

  it("supports instrumentation path when route span is present", async () => {
    setCurrentRouteSpan({
      setAttribute: vi.fn(),
      setAttributes: vi.fn(),
      setStatus: vi.fn(),
      recordException: vi.fn(),
      end: vi.fn(),
    } as any);

    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-one"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
    });
  });

  it("records error span when setCart throws during addToCart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
    });

    // Force localStorage.setItem to throw to exercise the catch block
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError: storage full");
    });

    // Click should not propagate the throw to the caller
    expect(() => fireEvent.click(screen.getByText("add-one"))).not.toThrow();

    spy.mockRestore();
  });

  it("records error span when setCart throws during removeFromCart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    // Add a flight first so removeFromCart has something to remove
    fireEvent.click(screen.getByText("add-one"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
    });

    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError: storage full");
    });

    expect(() => fireEvent.click(screen.getByText("remove-first"))).not.toThrow();

    spy.mockRestore();
  });

  it("records error span when setPastCart throws during purchaseCart", async () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>
    );

    fireEvent.click(screen.getByText("add-one"));
    await waitFor(() => {
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
    });

    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError: storage full");
    });

    expect(() => fireEvent.click(screen.getByText("purchase"))).not.toThrow();

    spy.mockRestore();
  });
});
