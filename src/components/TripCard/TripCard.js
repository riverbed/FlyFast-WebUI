import { Card, Group, Text } from '@mantine/core';

const TripCard = ({ from, to, flights, departureTime, arrivalTime, fare }) => {
  return (
    <Card radius="md" withBorder>
      <Group position="apart">
        <Text>
          {departureTime} - {arrivalTime}
        </Text>
        <Group position="center" direction="column">
          <Text>
            Total Time
          </Text>
          <Text>
            {from} - {to}
          </Text>
        </Group>
        <Group position="center" direction="column">
          {flights.map((flight, index) => (
            <div key={index}>
              <Text>
                {flight.flightNumber}
              </Text>
              <Text>
                {flight.from} - {flight.to}
              </Text>
              <Text>
                {flight.departureTime} - {flight.arrivalTime}
              </Text>
              <Text>
                {flight.seat}
              </Text>
            </div>
          ))}
        </Group>
        <Text weight={700}>
          ${fare}
        </Text>
      </Group>
    </Card>
  )
}

export default TripCard;