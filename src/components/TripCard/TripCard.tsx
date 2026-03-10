import { useState, useEffect, useContext } from "react";
import {
  Card,
  Grid,
  Group,
  Stack,
  Text,
  Collapse,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import { BsFillCartPlusFill } from "react-icons/bs";

import FlightDetails from "./FlightDetails";
import { CartContext } from "../../services/Context";
import { timeConversion, timeDifference } from "../../services/Functions";
import type { FlightSegment } from "../../services/Flight";

interface TripCardProps {
  from: string;
  to: string;
  flights: FlightSegment[];
  departureTime: string;
  arrivalTime: string;
  fare: number;
}

const TripCard = ({ from, to, flights, departureTime, arrivalTime, fare }: TripCardProps) => {
  const cartContext = useContext(CartContext);
  const [openFlightDetails, setOpenFlightDetails] = useState(false);
  const cardTimeOption: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  useEffect(() => {
    setOpenFlightDetails(false);
  }, [from, to, flights, departureTime, arrivalTime, fare]);

  if (!cartContext) {
    return null;
  }

  const { addToCart } = cartContext;

  return (
    <Card radius="md" m="xs" withBorder>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Stack align="center" gap={0}>
            <Text>
              {timeConversion(departureTime, cardTimeOption)} -
              {" "}
              {timeConversion(arrivalTime, cardTimeOption)}
            </Text>
            <Text>
              {from} - {to}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Stack align="center" gap={0}>
            <Text>Total Time: {timeDifference(departureTime, arrivalTime)}</Text>
            <Text>Total Flights: {flights.length}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Group justify="flex-end">
            <Text fw={700}>${fare}</Text>
            <ActionIcon
              onClick={() => setOpenFlightDetails((open) => !open)}
              data-testid="trip-card-toggle-details-button"
            >
              {openFlightDetails ? <MdOutlineArrowDropUp /> : <MdOutlineArrowDropDown />}
            </ActionIcon>
            <ActionIcon
              onClick={() => addToCart(flights)}
              data-testid="trip-card-add-to-cart-button"
            >
              <BsFillCartPlusFill />
            </ActionIcon>
          </Group>
        </Grid.Col>
      </Grid>
      <Collapse in={openFlightDetails}>
        <Divider my="sm" />
        <FlightDetails flights={flights} cart={true} />
      </Collapse>
    </Card>
  );
};

export default TripCard;
