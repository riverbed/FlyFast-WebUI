import { useState } from 'react';
import { Pagination } from '@mantine/core';

import NoResults from './NoResults';
import TripCard from '../TripCard/TripCard';

const Results = ({ fromData, toData, resultsData }) => {
  const [activePage, setPage] = useState(1);
  const DATA_PER_PAGE = 10;

  function pageinate(arrData){
    return arrData.slice((activePage - 1) * DATA_PER_PAGE, activePage * DATA_PER_PAGE);
  }

  return (
    <>
      {resultsData.length === 0 ?
        <NoResults fromData={fromData} toData={toData} />
      :
        <>
          {pageinate(resultsData).map((trip, index) => (
            <TripCard
              key={index}
              from={trip.from}
              to={trip.to}
              flights={trip.flights}
              departureTime={trip.departureTime}
              arrivalTime={trip.arrivalTime}
              fare={trip.fare}
            />
          ))}
          <Pagination
            total={Math.ceil(resultsData.length / DATA_PER_PAGE)}
            page={activePage}
            onChange={setPage}
            position="center"
            withEdges
            withControls
          />
        </>
      }
    </>
  );
}

export default Results;