/**
 * Purpose: This file (Context.tsx) supports the services area of the FlyFast booking workflow.
 */
import { createContext, type ReactNode } from "react";
import { useLocalStorage } from "@mantine/hooks";

import { jsonSerialize, jsonDeserialize } from "@/services/Functions";
import type { FlightSegment } from "@/services/Flight";

export interface CartContextValue {
  cart: FlightSegment[];
  pastCart: FlightSegment[];
  addToCart: (flights: FlightSegment[]) => void;
  removeFromCart: (index: number) => void;
  purchaseCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export const getStorageConfig = (key: string) => ({
  key,
  serialize: jsonSerialize,
  deserialize: (value: string | undefined) =>
    jsonDeserialize<FlightSegment[]>(value ?? "[]") as FlightSegment[],
  defaultValue: [] as FlightSegment[],
  getInitialValueInEffect: true,
});

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useLocalStorage<FlightSegment[]>(getStorageConfig("cart"));

  const [pastCart, setPastCart] = useLocalStorage<FlightSegment[]>(
    getStorageConfig("pastCart")
  );

  // Appends selected flights to the active cart.
  const addToCart = (flights: FlightSegment[]) => {
    setCart([...cart, ...flights]);
  };

  // Removes one flight segment by index from the active cart.
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Moves current cart into purchase history and clears the checkout cart.
  const purchaseCart = () => {
    setPastCart(cart);
    setCart([]);
  };

  const value: CartContextValue = {
    cart,
    pastCart,
    addToCart,
    removeFromCart,
    purchaseCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
