import { useState, useEffect } from 'react';

import FlightDetails from '../TripCard/FlightDetails';

const Cart = () => {
  const [storedFlights, setStoredFlights] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('cart')){
      setStoredFlights(JSON.parse(localStorage.getItem('cart')));
    }
  })

  return (
    <>
      {storedFlights.length === 0 ?
        "Nothing in the cart currently"
        :
        <FlightDetails
          flights={storedFlights}
          addCart={false}
        />
      }
    </>
  );
}

export default Cart;