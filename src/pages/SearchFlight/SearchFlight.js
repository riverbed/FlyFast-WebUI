import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, Text } from "@mantine/core";

import Search from '../../components/Search/Search';
import { searchFlight } from '../../services/Flight';

const SearchFlight = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState('');

  useEffect(() => {
    searchFlight(searchParams.get('from'), searchParams.get('to'), searchParams.get('departure'), searchParams.get('return'), searchParams.get('seat'))
      .then( result => {
        setResult(JSON.stringify(result));
      })
      .catch( error => console.error(error) );
  }, [searchParams])

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
          {result}
        </Text>
      </Grid.Col>
    </Grid>
  );
}

export default SearchFlight;