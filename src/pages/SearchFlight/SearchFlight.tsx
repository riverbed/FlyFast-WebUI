/**
 * Purpose: This file (SearchFlight.tsx) supports the SearchFlight area of the FlyFast booking workflow.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

import { Grid, LoadingOverlay } from "@mantine/core";

import Search from "@/components/Search/Search";
import SearchResults from "@/components/SearchResults/SearchResults";
import { searchFlight, type TripResult } from "@/services/Flight";

interface SearchCriteria {
  from: string | null;
  to: string | null;
  departureDate: string | null;
  returnDate: string | null;
  seat: string | null;
}

const getCriteriaFromParams = (params: URLSearchParams): SearchCriteria => ({
  from: params.get("from"),
  to: params.get("to"),
  departureDate: params.get("departure"),
  returnDate: params.get("return"),
  seat: params.get("seat"),
});

const SearchFlight = () => {
  const [searchParams] = useSearchParams();
  const [overlayShow, setOverlayShow] = useState(false);
  const [result, setResult] = useState<TripResult[][]>([[]]);

  useEffect(() => {
    // Fetches search results whenever query parameters change.
    async function retrieveFlight(criteria: SearchCriteria) {
      setOverlayShow(true);
      try {
        const response = await searchFlight(
          criteria.from,
          criteria.to,
          criteria.departureDate,
          criteria.returnDate,
          criteria.seat
        );
        setResult(response);
      } catch (error) {
        console.error(error);
        setResult([[]]);
      }

      setOverlayShow(false);
    }

    retrieveFlight(getCriteriaFromParams(searchParams));
  }, [searchParams]);

  return (
    <Grid justify="center" align="center">
      <Grid.Col span={10}>
        <Search
          fromData={searchParams.get("from") ?? undefined}
          toData={searchParams.get("to") ?? undefined}
          seatData={searchParams.get("seat") ?? undefined}
          tripDateData={[searchParams.get("departure"), searchParams.get("return")]}
        />
      </Grid.Col>
      <Grid.Col span={10}>
        <LoadingOverlay visible={overlayShow} />
        <SearchResults
          fromData={searchParams.get("from") ?? ""}
          toData={searchParams.get("to") ?? ""}
          results={result}
        />
      </Grid.Col>
    </Grid>
  );
};

export default SearchFlight;
