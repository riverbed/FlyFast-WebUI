import { useContext } from 'react';
import { Button, Card, Stack, Group, Title, Text, Divider } from '@mantine/core';

import { CartContext } from '../../services/Context';

const Cost = () => {
  const { cart } = useContext(CartContext);
  const SUBTOTAL = cart.reduce((total, flight) => total + flight.fare, 0);
  const TAX = 0.0875;

  return (
    <Card radius="md" m="xs" withBorder>
      <Stack>
        <Title order={4}>
          Order Summary
        </Title>
        <Divider />
        <Group position="apart">
          <Text>
            Total Flights:
          </Text>
          <Text>
            {cart.length}
          </Text>
        </Group>
        <Group position="apart">
          <Text>
            Subtotal:
          </Text>
          <Text>
            ${SUBTOTAL}
          </Text>
        </Group>
        <Group position="apart">
          <Text>
            Taxes, fees, and charges:
          </Text>
          <Text>
            ${Math.round(SUBTOTAL * TAX * 100) / 100}
          </Text>
        </Group>
        <Divider variant="dotted"/>
        <Group position="apart">
          <Text weight="bold" size="lg">
            Total:
          </Text>
          <Text weight="bold" size="lg">
            ${(Math.round(SUBTOTAL * TAX * 100) / 100 + SUBTOTAL)}
          </Text>
        </Group>
        <Button
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
          disabled={cart.length === 0}
        >
          Proceed
        </Button>
      </Stack>
    </Card>
  );
}

export default Cost;