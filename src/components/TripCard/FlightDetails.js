import { Divider } from '@mantine/core';

import Flight from '../Flight/Flight';

const FlightDetails = ({ flights }) => {
  return (
    flights.map((flight, index) => (
      <div key={index}>
        <Flight index={index} flight={flight} addCart={true} />
        {index !== flights.length - 1 &&
          <Divider my="sm" variant="dashed" />
        }
      </div>
    ))
  )
}

export default FlightDetails;