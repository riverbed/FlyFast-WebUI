import { Card } from '@mantine/core';

import Flight from '../Flight/Flight';

const FlightDetails = ({ flights, cart }) => {
  return (
    flights.map((flight, index) => (
      <Card radius="md" m="xs" withBorder key={index}>
        <Flight index={index} flight={flight} cart={cart} addCart={false} />
      </Card>
    ))
  )
}

export default FlightDetails;