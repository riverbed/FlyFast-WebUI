import { useState } from 'react';
import { Card, Group, Text, Collapse, ActionIcon, Divider } from '@mantine/core';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';

import FlightDetails from './FlightDetails';

const TripCard = ({ from, to, flights, departureTime, arrivalTime, fare }) => {
  const [openFlightDetails, setOpenFlightDetails] = useState(false);

  return (
    <Card radius="md" m="xs" withBorder>
      <Group position="apart">
        <Group position="center" spacing={0} direction="column">
          <Text>
            {departureTime} - {arrivalTime}
          </Text>
          <Text>
            {from} - {to}
          </Text>
        </Group>
        <Group position="center" spacing={0} direction="column">
          <Text>
            Total Time: 7 Hours
          </Text>
          <Text>
            Total Flights: {flights.length}
          </Text>
        </Group>
        <Group>
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
        </Group>
      </Group>
      <Collapse in={openFlightDetails}>
        <Divider my="sm" />
        <FlightDetails flights={flights} />
      </Collapse>
    </Card>
  )
}

export default TripCard;