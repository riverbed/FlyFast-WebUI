import { useState } from 'react';
import { Grid, Text } from "@mantine/core";

import Search from '../../components/Search/Search';

const HomeAlternative = () => {
  const [result, setResult] = useState('');

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search
          useBackend={true}
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

export default HomeAlternative;