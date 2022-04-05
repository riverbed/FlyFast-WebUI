import { useContext } from 'react';
import { Grid, Group, Stack, Text, ActionIcon, Divider } from '@mantine/core';
import { BsFillCartPlusFill, BsFillCartDashFill } from 'react-icons/bs';

import { timeConversion } from '../../services/Functions';
import { CartContext } from '../../services/Context';

const FlightDetails = ({ flights, addCart }) => {
  const { addToCart, removeFromCart } = useContext(CartContext);
  const cardTimeOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  function cartButton(e, index, flight){
    e.preventDefault();
    addCart ? addToCart(flight) : removeFromCart(index);
  }

  return (
    <>
      {flights.map((flight, index) => (
        <div key={index}>
          <Grid>
            <Grid.Col xs={12} sm={2}>
              <Stack align="center" spacing={0}>
                <Text>
                  {flight.flightNumber}
                </Text>
                <Text>
                  {flight.airline}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col xs={12} sm={6} md={7}>
              <Stack align="center" spacing={0}>
                <Text>
                  {timeConversion(flight.departureTime, cardTimeOption)} - {timeConversion(flight.arrivalTime, cardTimeOption)}
                </Text>
                <Text>
                  {flight.from} - {flight.to}
                </Text>
              </Stack>
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
                <ActionIcon onClick={(e) => cartButton(e, index, [flight])}>
                  {addCart ?
                    <BsFillCartPlusFill />
                    :
                    <BsFillCartDashFill />
                  }
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