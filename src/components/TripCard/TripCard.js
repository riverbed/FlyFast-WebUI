import { useState, useEffect } from 'react';
import { Card, Grid, Group, Text, Collapse, ActionIcon, Divider } from '@mantine/core';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';
import { BsFillCartPlusFill } from 'react-icons/bs';

import FlightDetails from './FlightDetails';

const TripCard = ({ from, to, flights, departureTime, arrivalTime, fare }) => {
  const [openFlightDetails, setOpenFlightDetails] = useState(false);
  const cardTimeOption = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

  useEffect(() => {
    setOpenFlightDetails(false);
  }, [from, to, flights, departureTime, arrivalTime, fare])

  function timeConversion(timeFormat, options){
    const date = new Date(timeFormat);
    const formattedTime = date.toLocaleDateString(undefined, options);
    return formattedTime;
  }

  function timeDifference(departureTime, arrivalTime){
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);
    const dateDifference = Math.abs(departureDate - arrivalDate);
    const dateHours = Math.floor((dateDifference / (1000 * 60 * 60)) % 24);
    const dateMinutes = Math.floor((dateDifference / (1000 * 60)) % 60);
    let totalTime = dateHours > 0 ? dateHours + " Hours " : " ";
    totalTime += dateMinutes > 0 ? dateMinutes + " Minutes" : "";
    return totalTime;
  }

  return (
    <Card radius="md" m="xs" withBorder>
      <Grid>
        <Grid.Col xs={12} sm={4}>
          <Group position="center" spacing={0} direction="column">
            <Text>
              {timeConversion(departureTime, cardTimeOption)} - {timeConversion(arrivalTime, cardTimeOption)}
            </Text>
            <Text>
              {from} - {to}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col xs={12} sm={4}>
          <Group position="center" spacing={0} direction="column">
            <Text>
              Total Time: {timeDifference(departureTime, arrivalTime)}
            </Text>
            <Text>
              Total Flights: {flights.length}
            </Text>
          </Group>
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
            <ActionIcon>
              <BsFillCartPlusFill />
            </ActionIcon>
          </Group>
        </Grid.Col>
      </Grid>
      <Collapse in={openFlightDetails}>
        <Divider my="sm" />
        <FlightDetails flights={flights} timeConversion={timeConversion} />
      </Collapse>
    </Card>
  )
}

export default TripCard;