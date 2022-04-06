import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Button, Center } from '@mantine/core';
import { BsFillCartFill } from 'react-icons/bs';

import { CartContext } from '../../services/Context';

import EmptyCart from './EmptyCart';
import FlightDetails from './FlightDetails';

const Cart = ({ checkoutButton }) => {
  const { cart } = useContext(CartContext);

  return (
    <>
      {cart.length === 0 ?
        <EmptyCart />
        :
        <>
          <FlightDetails flights={cart} />
          {checkoutButton && 
            <Center>
              <Button
                leftIcon={<BsFillCartFill />}
                variant="gradient"
                gradient={{ from: '#ed6ea0', to: '#ec8c69' }}
                component={Link}
                to="/checkout"
              >
                Checkout
              </Button>
            </Center>
          }
        </>
      }
    </>
  );
}

export default Cart;