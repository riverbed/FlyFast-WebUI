/**
 * Purpose: This file (Flight.tsx) supports the Flight area of the FlyFast booking workflow.
 */
import { useContext } from "react";
import { Grid, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { BsFillCartPlusFill, BsFillCartDashFill } from "react-icons/bs";

import { timeConversion } from "@/services/Functions";
import { CartContext } from "@/services/Context";
import type { FlightSegment } from "@/services/Flight";

interface FlightProps {
  index: number;
  flight: FlightSegment;
  cart: boolean;
  addCart: boolean;
}

const Flight = ({ index, flight, cart, addCart }: FlightProps) => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    return null;
  }

  const { addToCart, removeFromCart } = cartContext;
  const cardTimeOption: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  function cartButton(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    addCart ? addToCart([flight]) : removeFromCart(index);
  }

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 2 }}>
        <Stack align="center" gap={0}>
          <Text>{flight.flightNumber}</Text>
          <Text>{flight.airline}</Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 7 }}>
        <Stack align="center" gap={0}>
          <Text>
            {timeConversion(flight.departureTime, cardTimeOption)} -
            {" "}
            {timeConversion(flight.arrivalTime, cardTimeOption)}
          </Text>
          <Text>
            {flight.from} - {flight.to}
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 2, md: 1 }}>
        <Group justify="center">
          <Text>{flight.seat}</Text>
        </Group>
      </Grid.Col>
      <Grid.Col span={{ base: 6, sm: 2 }}>
        <Group justify="flex-end">
          <Text>${flight.fare}</Text>
          {cart && (
            <ActionIcon onClick={cartButton} data-testid="flight-cart-toggle-button">
              {addCart ? <BsFillCartPlusFill /> : <BsFillCartDashFill />}
            </ActionIcon>
          )}
        </Group>
      </Grid.Col>
    </Grid>
  );
};

export default Flight;
