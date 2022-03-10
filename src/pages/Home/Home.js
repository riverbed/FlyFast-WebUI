import { useState } from 'react';
import { Grid, Text } from "@mantine/core";

import Search from '../../components/Search/Search';

const Home = () => {
  const [result, setResult] = useState('');

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search 
          useBackend={false}
          dataChange={(dataChange) => setResult(dataChange)}
        />
      </Grid.Col>
      <Grid.Col span={10}>
        <Text>
          {result}
        </Text>
      </Grid.Col>
    </Grid>
  );
}

export default Home;