import { useContext } from 'react';
import { CartContext } from '../../services/Context';

import EmptyCart from './EmptyCart';
import FlightDetails from './FlightDetails';

const Cart = () => {
  const { cart } = useContext(CartContext);

  return (
    <>
      {cart.length === 0 ?
        <EmptyCart />
        :
        <>
          <FlightDetails flights={cart} />
          {/* Head To Checkout Page */}
        </>
      }
    </>
  );
}

export default Cart;