import { Group, Text } from '@mantine/core';

const FlightDetails = ({ flights }) => {
  return (
    <>
      {flights.map((flight, index) => (
        <Group key={index} position="apart">
          <Group position="center" spacing="xs" direction="column">
            <Text>
              {flight.flightNumber}
            </Text>
            <Text>
              {flight.airline}
            </Text>
          </Group>
          <Group position="center" spacing="xs" direction="column">
            <Text>
              {flight.from} - {flight.to}
            </Text>
            <Text>
              {flight.departureTime} - {flight.arrivalTime}
            </Text>
          </Group>
          <Text>
            {flight.seat}
          </Text>
          <Text>
            {flight.fare}
          </Text>
        </Group>
      ))}
    </>
  )
}

export default FlightDetails;