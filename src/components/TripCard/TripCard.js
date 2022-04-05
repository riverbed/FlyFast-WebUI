import { useState, useEffect, useContext } from 'react';
import { Card, Grid, Group, Stack, Text, Collapse, ActionIcon, Divider } from '@mantine/core';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';
import { BsFillCartPlusFill } from 'react-icons/bs';

import FlightDetails from './FlightDetails';
import { CartContext } from '../../services/Context';
import { timeConversion, timeDifference } from '../../services/Functions';

const TripCard = ({ from, to, flights, departureTime, arrivalTime, fare }) => {
  const { addToCart } = useContext(CartContext);
  const [openFlightDetails, setOpenFlightDetails] = useState(false);
  const cardTimeOption = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  useEffect(() => {
    setOpenFlightDetails(false);
  }, [from, to, flights, departureTime, arrivalTime, fare])

  return (
    <Card radius="md" m="xs" withBorder>
      <Grid>
        <Grid.Col xs={12} sm={4}>
          <Stack align="center" spacing={0}>
            <Text>
              {timeConversion(departureTime, cardTimeOption)} - {timeConversion(arrivalTime, cardTimeOption)}
            </Text>
            <Text>
              {from} - {to}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col xs={12} sm={4}>
          <Stack align="center" spacing={0}>
            <Text>
              Total Time: {timeDifference(departureTime, arrivalTime)}
            </Text>
            <Text>
              Total Flights: {flights.length}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col xs={12} sm={4}>
          <Group position="right">
            <Text weight={700}>
              ${fare}
            </Text>
            <ActionIcon onClick={() => setOpenFlightDetails((open) => !open)}>
              {openFlightDetails ?
                <MdOutlineArrowDropUp />
                :
                <MdOutlineArrowDropDown />
              }
            </ActionIcon>
            <ActionIcon onClick={() => addToCart(flights)}>
              <BsFillCartPlusFill />
            </ActionIcon>
          </Group>
        </Grid.Col>
      </Grid>
      <Collapse in={openFlightDetails}>
        <Divider my="sm" />
        <FlightDetails
          flights={flights}
          addCart={true}
        />
      </Collapse>
    </Card>
  )
}

export default TripCard;