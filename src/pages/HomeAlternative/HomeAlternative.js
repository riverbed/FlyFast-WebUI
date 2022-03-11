import { Grid } from "@mantine/core";

import Search from '../../components/Search/Search';

const HomeAlternative = () => {
  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search
          useBackend={true}
        />
      </Grid.Col>
    </Grid>
  );
}

export default HomeAlternative;