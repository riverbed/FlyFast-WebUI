import { createContext } from "react";
import { useLocalStorage } from '@mantine/hooks';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage({
    key: 'cart',
    serialize: (value) => {
      return JSON.stringify(value);
    },
    deserialize: (localStorageValue) => {
      return JSON.parse(localStorageValue);
    },
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

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>{children}</CartContext.Provider>
}