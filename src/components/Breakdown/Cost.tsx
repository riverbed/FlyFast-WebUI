/**
 * Purpose: This file (Cost.tsx) supports the Breakdown area of the FlyFast booking workflow.
 */
import { useContext } from "react";
import { Button, Card, Stack, Group, Title, Text, Divider } from "@mantine/core";

import { CartContext } from "@/services/Context";

interface CostProps {
  proceedButton: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const TAX_RATE = 0.0875;

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const Cost = ({ proceedButton }: CostProps) => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    return null;
  }

  const { cart } = cartContext;
  // Totals are derived from cart state to avoid duplicated pricing state.
  const subTotal = cart.reduce((total, flight) => total + flight.fare, 0);
  const taxAmount = roundCurrency(subTotal * TAX_RATE);
  const total = roundCurrency(subTotal + taxAmount);

  return (
    <Card radius="md" m="xs" withBorder>
      <Stack>
        <Title order={4}>Order Summary</Title>
        <Divider />
        <Group justify="space-between">
          <Text>Total Flights:</Text>
          <Text>{cart.length}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Subtotal:</Text>
          <Text>${subTotal}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Taxes, fees, and charges:</Text>
          <Text>${taxAmount}</Text>
        </Group>
        <Divider variant="dotted" />
        <Group justify="space-between">
          <Text fw={700} size="lg">
            Total:
          </Text>
          <Text fw={700} size="lg">
            ${total}
          </Text>
        </Group>
        <Button
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          disabled={cart.length === 0}
          onClick={proceedButton}
          data-testid="checkout-proceed-button"
        >
          Proceed
        </Button>
      </Stack>
    </Card>
  );
};

export default Cost;
