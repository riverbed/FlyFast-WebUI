import { createContext, type ReactNode } from "react";
import { useLocalStorage } from "@mantine/hooks";

import { jsonSerialize, jsonDeserialize } from "./Functions";
import type { FlightSegment } from "./Flight";

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

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useLocalStorage<FlightSegment[]>({
    key: "cart",
    serialize: jsonSerialize,
    deserialize: (value) =>
      jsonDeserialize<FlightSegment[]>(value ?? "[]") as FlightSegment[],
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const [pastCart, setPastCart] = useLocalStorage<FlightSegment[]>({
    key: "pastCart",
    serialize: jsonSerialize,
    deserialize: (value) =>
      jsonDeserialize<FlightSegment[]>(value ?? "[]") as FlightSegment[],
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const addToCart = (flights: FlightSegment[]) => {
    setCart([...cart, ...flights]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

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
