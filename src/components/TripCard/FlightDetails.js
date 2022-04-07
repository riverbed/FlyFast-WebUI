import { Divider } from '@mantine/core';

import Flight from '../Flight/Flight';

const FlightDetails = ({ flights, cart }) => {
  return (
    flights.map((flight, index) => (
      <div key={index}>
        <Flight index={index} flight={flight} cart={cart} addCart={true} />
        {index !== flights.length - 1 &&
          <Divider my="sm" variant="dashed" />
        }
      </div>
    ))
  )
}

export default FlightDetails;