import { Grid } from "@mantine/core";

import Cart from "../../components/Cart/Cart";

const Checkout = () => {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Cart checkoutButton={false}/>
      </Grid.Col>
    </Grid>
  );
}

export default Checkout;