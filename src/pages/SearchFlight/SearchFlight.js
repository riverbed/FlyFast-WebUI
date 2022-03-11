import { useSearchParams } from 'react-router-dom';
import { Grid, Text } from "@mantine/core";

import Search from '../../components/Search/Search';

const SearchFlight = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search
          fromData={searchParams.get('from')}
          toData={searchParams.get('to')}
          seatData={searchParams.get('seat')}
          tripDateData={[searchParams.get('departure'), searchParams.get('return')]}
          useBackend={false}
        />
      </Grid.Col>
      <Grid.Col span={10}>
        <Text>
          
        </Text>
      </Grid.Col>
    </Grid>
  );
}

export default SearchFlight;