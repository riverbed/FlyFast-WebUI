import { useState, useEffect } from 'react';

import FlightDetails from '../TripCard/FlightDetails';

const Cart = () => {
  const [storedFlights, setStoredFlights] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('cart')){
      setStoredFlights(JSON.parse(localStorage.getItem('cart')));
    }
  })

  function timeConversion(timeFormat, options){
    const date = new Date(timeFormat);
    const formattedTime = date.toLocaleDateString(undefined, options);
    return formattedTime;
  }

  function addToCart(e, flights){
    e.preventDefault();
    let storedFlights = [];
    if (localStorage.getItem('cart')){
      storedFlights = JSON.parse(localStorage.getItem('cart'));
    }
    localStorage.setItem('cart', JSON.stringify([...storedFlights, ...flights]));
  }

  return (
    <>
      {storedFlights.length === 0 ?
        "Nothing in the cart currently"
      :
        <FlightDetails
          flights={storedFlights}
          timeConversion={timeConversion}
          addToCart={addToCart}
        />
      }
    </>
  );
}

export default Cart;