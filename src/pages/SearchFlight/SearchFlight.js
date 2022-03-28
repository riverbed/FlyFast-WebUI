import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Grid, LoadingOverlay } from "@mantine/core";

import Search from '../../components/Search/Search';
import SearchResults from '../../components/SearchResults/SearchResults';
import { searchFlight } from '../../services/Flight';

const SearchFlight = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [overlayShow, setOverlayShow] = useState(false);
  const [result, setResult] = useState([[]]);
  const testResult = [
    [
      {
        'from': 'LAX', 
        'to': 'JFK', 
        'flights': [
          { 
            'flightNumber': '113',
            'airline': 'ABC Airlines',
            'from': 'LAX', 
            'to': 'LGA', 
            'departureTime': '10:37', 
            'arrivalTime': '15:37', 
            'seat': 'Economy',
            'fare': '200'
          },
          { 
            'flightNumber': '117',
            'airline': 'ABC Airlines',
            'from': 'LGA', 
            'to': 'JFK', 
            'departureTime': '16:37', 
            'arrivalTime': '17:37', 
            'seat': 'Economy',
            'fare': '100'
          }
        ],
        'departureTime': '10:37', 
        'arrivalTime': '17:37', 
        'fare': '300'
      }
    ]
  ];

  useEffect(() => {
    async function retrieveFlight(from, to, departureDate, returnDate, seat){
      setOverlayShow(true);
      await searchFlight(from, to, departureDate, returnDate, seat)
      .then( result => {
        setResult(JSON.stringify(result));
      })
      .catch( error => console.error(error) );
      setOverlayShow(false);
    }
    retrieveFlight(searchParams.get('from'), searchParams.get('to'), searchParams.get('departure'), searchParams.get('return'), searchParams.get('seat'));
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
        <LoadingOverlay visible={overlayShow} />
        <SearchResults
          fromData={searchParams.get('from')}
          toData={searchParams.get('to')}
          results={testResult}
        />
      </Grid.Col>
    </Grid>
  );
}

export default SearchFlight;