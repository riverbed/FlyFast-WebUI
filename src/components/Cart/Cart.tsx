import { useContext } from "react";

import { CartContext } from "../../services/Context";

import EmptyCart from "./EmptyCart";
import FlightDetails from "./FlightDetails";

const Cart = () => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    return null;
  }

  const { cart } = cartContext;

  return <>{cart.length === 0 ? <EmptyCart /> : <FlightDetails flights={cart} cart={true} />}</>;
};

export default Cart;
