import { useState, useEffect } from "react";
import { Group, Pagination } from "@mantine/core";

import NoResults from "./NoResults";
import TripCard from "../TripCard/TripCard";
import type { TripResult } from "../../services/Flight";

interface ResultsProps {
  fromData: string;
  toData: string;
  resultsData: TripResult[];
}

const Results = ({ fromData, toData, resultsData }: ResultsProps) => {
  const [activePage, setPage] = useState(1);
  const DATA_PER_PAGE = 10;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [activePage]);

  function paginate(arrData: TripResult[]) {
    return arrData.slice((activePage - 1) * DATA_PER_PAGE, activePage * DATA_PER_PAGE);
  }

  return (
    <>
      {resultsData.length === 0 ? (
        <NoResults fromData={fromData} toData={toData} />
      ) : (
        <>
          {paginate(resultsData).map((trip, index) => (
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
          <Group justify="center" mt="sm">
            <Pagination
              total={Math.ceil(resultsData.length / DATA_PER_PAGE)}
              value={activePage}
              onChange={setPage}
              withEdges
              withControls
            />
          </Group>
        </>
      )}
    </>
  );
};

export default Results;
