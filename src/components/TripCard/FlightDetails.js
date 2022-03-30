import { Grid, Group, Text, ActionIcon, Divider } from '@mantine/core';
import { BsFillCartPlusFill } from 'react-icons/bs';

const FlightDetails = ({ flights, timeConversion, addToCart }) => {
  const cardTimeOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  return (
    <>
      {flights.map((flight, index) => (
        <div key={index}>
          <Grid>
            <Grid.Col xs={12} sm={2}>
              <Group position="center" spacing={0} direction="column">
                <Text>
                  {flight.flightNumber}
                </Text>
                <Text>
                  {flight.airline}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col xs={12} sm={6} md={7}>
              <Group position="center" spacing={0} direction="column">
                <Text>
                  {timeConversion(flight.departureTime, cardTimeOption)} - {timeConversion(flight.arrivalTime, cardTimeOption)}
                </Text>
                <Text>
                  {flight.from} - {flight.to}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col xs={6} sm={2} md={1}>
              <Group position="center">
                <Text>
                  {flight.seat}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col xs={6} sm={2}>
              <Group position="right">
                <Text>
                  ${flight.fare}
                </Text>
                <ActionIcon onClick={(e) => addToCart(e, [flight])}>
                  <BsFillCartPlusFill />
                </ActionIcon>
              </Group>
            </Grid.Col>
          </Grid>
          {index !== flights.length - 1 &&
            <Divider my="sm" variant="dashed" />
          }
        </div>
      ))}
    </>
  )
}

export default FlightDetails;