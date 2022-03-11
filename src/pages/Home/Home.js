import { Grid } from "@mantine/core";

import Search from '../../components/Search/Search';

const Home = () => {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search 
          useBackend={false}
        />
      </Grid.Col>
    </Grid>
  );
}

export default Home;