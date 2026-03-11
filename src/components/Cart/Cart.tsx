/**
 * Purpose: This file (Cart.tsx) supports the Cart area of the FlyFast booking workflow.
 */
import { useContext } from "react";

import { CartContext } from "@/services/Context";

import EmptyCart from "@/components/Cart/EmptyCart";
import FlightDetails from "@/components/Cart/FlightDetails";

const Cart = () => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    return null;
  }

  const { cart } = cartContext;

  // Renders either a friendly empty state or the current list of selected flights.
  return <>{cart.length === 0 ? <EmptyCart /> : <FlightDetails flights={cart} cart={true} />}</>;
};

export default Cart;
