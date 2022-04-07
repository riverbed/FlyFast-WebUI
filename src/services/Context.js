import { createContext } from "react";
import { useLocalStorage } from '@mantine/hooks';

import { jsonSerialize, jsonDeserialize } from "./Functions";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage({
    key: 'cart',
    serialize: jsonSerialize,
    deserialize: jsonDeserialize,
    defaultValue: [],
    getInitialValueInEffect: true
  });

  const [pastCart, setPastCart] = useLocalStorage({
    key: 'pastCart',
    serialize: jsonSerialize,
    deserialize: jsonDeserialize,
    defaultValue: [],
    getInitialValueInEffect: true
  });

  const addToCart = (flight) => {
    return setCart([...cart, ...flight]);
  }

  const removeFromCart = (index) => {
    let newCart = [...cart];
    newCart.splice(index, 1);
    return setCart(newCart);
  }

  const purchaseCart = () => {
    setPastCart(cart);
    setCart([]);
  }

  return <CartContext.Provider value={{ cart, pastCart, addToCart, removeFromCart, purchaseCart }}>{children}</CartContext.Provider>
}