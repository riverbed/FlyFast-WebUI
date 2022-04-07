import { Grid, Title } from "@mantine/core";

import Cart from "../../components/Cart/Cart";
import Cost from "../../components/Breakdown/Cost";

const Checkout = () => {
  return (
    <Grid>
      <Grid.Col xs={12} md={8}>
        <Title order={3} my={8} p={16}>
          My Cart
        </Title>
        <Cart />
      </Grid.Col>
      <Grid.Col xs={12} md={4}>
        <Cost />
      </Grid.Col>
    </Grid>
  );
}

export default Checkout;