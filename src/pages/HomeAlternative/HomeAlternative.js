import { useState } from 'react';
import { Grid, Text } from "@mantine/core";

import SearchBackend from '../../components/Search/SearchBackend';

const HomeAlternative = () => {
  const [result, setResult] = useState('');

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <SearchBackend 
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