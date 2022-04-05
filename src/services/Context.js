import { createContext } from "react";
import { useLocalStorage } from '@mantine/hooks';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useLocalStorage({
    key: 'cart',
    serialize: (value) => {
      try {
        return JSON.stringify(value);
      } catch (error) {
        console.error('Cart Serialize Error:\n' + error);
        return '';
      }
    },
    deserialize: (localStorageValue) => {
      try {
        return JSON.parse(localStorageValue);
      } catch (error) {
        console.error('Cart Deserialize Error:\n' + error);
        return [];
      }
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