import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { Grid, LoadingOverlay } from "@mantine/core";

import Search from "../../components/Search/Search";
import SearchResults from "../../components/SearchResults/SearchResults";
import { searchFlight, type TripResult } from "../../services/Flight";

const SearchFlight = () => {
  const [searchParams] = useSearchParams();
  const [overlayShow, setOverlayShow] = useState(false);
  const [result, setResult] = useState<TripResult[][]>([[]]);

  useEffect(() => {
    async function retrieveFlight(
      from: string | null,
      to: string | null,
      departureDate: string | null,
      returnDate: string | null,
      seat: string | null
    ) {
      setOverlayShow(true);
      await searchFlight(from, to, departureDate, returnDate, seat)
        .then((response) => {
          try {
            setResult(JSON.parse(JSON.stringify(response)) as TripResult[][]);
          } catch (error) {
            console.error(error);
            setResult([[]]);
          }
        })
        .catch((error) => console.error(error));
      setOverlayShow(false);
    }

    retrieveFlight(
      searchParams.get("from"),
      searchParams.get("to"),
      searchParams.get("departure"),
      searchParams.get("return"),
      searchParams.get("seat")
    );
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
