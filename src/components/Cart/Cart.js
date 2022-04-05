import { useContext } from 'react';
import { CartContext } from '../../services/Context';


import EmptyCart from './EmptyCart';
import FlightDetails from '../TripCard/FlightDetails';

const Cart = () => {
  const { cart } = useContext(CartContext);

  return (
    <>
      {cart.length === 0 ?
        <EmptyCart />
        :
        <>
          <FlightDetails
            flights={cart}
            addCart={false}
          />
          {/* Head To Checkout Page */}
        </>
      }
    </>
  );
}

export default Cart;