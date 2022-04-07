import { useContext } from 'react';
import { Stack, Text, Title, Grid } from '@mantine/core';
import { CartContext } from '../../services/Context';

import FlightDetails from '../Cart/FlightDetails';

const Confirmation = () => {
  const { cart } = useContext(CartContext);

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Stack align="center" spacing={5}>
          <Title order={1}>
            Thank You For Choosing FlyFast!
          </Title>
          <Text size='lg'>
            Your order has been placed. An email of your order has been sent to you.
          </Text>
          <Text size='lg'>
            Please allow a few minutes for your email to arrive.
          </Text>
        </Stack>
        <FlightDetails flights={cart} cart={false} />
      </Grid.Col>
    </Grid>
  );
}

export default Confirmation;