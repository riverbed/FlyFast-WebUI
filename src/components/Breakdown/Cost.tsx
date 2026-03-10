import { useContext } from "react";
import { Button, Card, Stack, Group, Title, Text, Divider } from "@mantine/core";

import { CartContext } from "../../services/Context";

interface CostProps {
  proceedButton: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Cost = ({ proceedButton }: CostProps) => {
  const cartContext = useContext(CartContext);
  if (!cartContext) {
    return null;
  }

  const { cart } = cartContext;
  const SUBTOTAL = cart.reduce((total, flight) => total + flight.fare, 0);
  const TAX = 0.0875;

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
          <Text>${SUBTOTAL}</Text>
        </Group>
        <Group justify="space-between">
          <Text>Taxes, fees, and charges:</Text>
          <Text>${Math.round(SUBTOTAL * TAX * 100) / 100}</Text>
        </Group>
        <Divider variant="dotted" />
        <Group justify="space-between">
          <Text fw={700} size="lg">
            Total:
          </Text>
          <Text fw={700} size="lg">
            ${Math.round((SUBTOTAL * TAX + SUBTOTAL) * 100) / 100}
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
