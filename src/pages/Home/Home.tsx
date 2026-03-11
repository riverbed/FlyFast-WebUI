/**
 * Purpose: This file (Home.tsx) supports the Home area of the FlyFast booking workflow.
 */
import { Grid } from "@mantine/core";

import Search from "@/components/Search/Search";

const Home = () => {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search />
      </Grid.Col>
    </Grid>
  );
};

export default Home;
