import { Group, Text } from '@mantine/core';

const FlightDetails = ({ flights, timeConversion }) => {
  const cardTimeOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  return (
    <>
      {flights.map((flight, index) => (
        <Group key={index} position="apart" mt="xs">
          <Group position="center" spacing={0} direction="column">
            <Text>
              {flight.flightNumber}
            </Text>
            <Text>
              {flight.airline}
            </Text>
          </Group>
          <Group position="center" spacing={0} direction="column">
            <Text>
              {timeConversion(flight.departureTime, cardTimeOption)} - {timeConversion(flight.arrivalTime, cardTimeOption)}
            </Text>
            <Text>
              {flight.from} - {flight.to}
            </Text>
          </Group>
          <Text>
            {flight.seat}
          </Text>
          <Text>
            ${flight.fare}
          </Text>
        </Group>
      ))}
    </>
  )
}

export default FlightDetails;