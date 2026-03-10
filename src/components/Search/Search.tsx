import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Group,
  Button,
  Paper,
  NativeSelect,
  Grid,
  type AutocompleteProps,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { BsCalendarWeek, BsSearch } from "react-icons/bs";
import {
  MdAirplanemodeActive,
  MdOutlineAirlineSeatReclineNormal,
  MdFlightLand,
  MdFlightTakeoff,
} from "react-icons/md";

import airports from "./AirportsData.json";
import seatTypes from "./SeatData.json";
import tripTypes from "./TripData.json";

import {
  airportFilter,
  AirportInformation,
  airportBackendFilter,
  type AirportItem,
} from "./AirportInformation";

import { airportTypeAhead } from "../../services/Flight";

interface SearchProps {
  fromData?: string;
  toData?: string;
  seatData?: string;
  tripDateData?: Array<string | null>;
}

type AirportItemInput = Omit<AirportItem, "label"> & { label?: string };

const Search = ({ fromData, toData, seatData, tripDateData }: SearchProps) => {
  const [loading, setLoading] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [airportData, setAirportData] = useState<AirportItem[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trip, setTrip] = useState("Round Trip");
  const [seat, setSeat] = useState("Economy");
  const [tripDate, setTripDate] = useState<[Date, Date]>([
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
  ]);

  const LIMITSET = 5;
  const navigate = useNavigate();

  const renderAirportOption: AutocompleteProps["renderOption"] = ({ option }) => (
    <AirportInformation {...(option as AirportItem)} />
  );

  useEffect(() => {
    setFrom(fromData ?? "");
    setTo(toData ?? "");
    setSeat(seatData ?? "Economy");
    setTrip(tripDateData?.[1] ? "Round Trip" : "One Way");

    if (tripDateData?.[0]) {
      const departure = new Date(tripDateData[0]);
      const returnCandidate = tripDateData[1]
        ? new Date(tripDateData[1])
        : new Date(departure.getTime() + 7 * 24 * 60 * 60 * 1000);
      setTripDate([departure, returnCandidate]);
    } else {
      setTripDate([
        new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      ]);
    }
  }, [fromData, toData, seatData, tripDateData]);

  useEffect(() => {
    if (useBackend) {
      airportTypeAhead(from, LIMITSET)
        .then((result) => {
          setAirportData(
            result.map((item) => ({ ...item, label: item.value }))
          );
        })
        .catch((error) => console.error(error));
    }
  }, [from, useBackend]);

  useEffect(() => {
    if (useBackend) {
      airportTypeAhead(to, LIMITSET)
        .then((result) => {
          setAirportData(
            result.map((item) => ({ ...item, label: item.value }))
          );
        })
        .catch((error) => console.error(error));
    }
  }, [to, useBackend]);

  const airportOptions = (useBackend ? airportData : (airports as AirportItemInput[])).map(
    (item) => ({ ...item, label: item.value })
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const endpoint = "/searchflight";
    const location = `?from=${from}&to=${to}`;
    const formattedDepartureDate =
      tripDate[0].getMonth() + 1 + "-" + tripDate[0].getDate() + "-" + tripDate[0].getFullYear();
    const departureDate = `&departure=${formattedDepartureDate}`;
    let returnDate = "";
    const seating = `&seat=${seat}`;

    if (trip === "Round Trip") {
      const formattedReturnDate =
        tripDate[1].getMonth() + 1 + "-" + tripDate[1].getDate() + "-" + tripDate[1].getFullYear();
      returnDate = `&return=${formattedReturnDate}`;
    }

    navigate(endpoint + location + departureDate + returnDate + seating);
    setLoading(false);
  }

  return (
    <Paper p="lg" shadow="sm" withBorder>
      <form onSubmit={handleSubmit} data-testid="search-form">
        <Group my="sm">
          <NativeSelect
            required
            leftSection={<MdAirplanemodeActive />}
            leftSectionPointerEvents="none"
            data={tripTypes}
            value={trip}
            onChange={(e) => setTrip(e.currentTarget.value)}
            data-testid="search-trip-type-select"
          />

          <NativeSelect
            required
            leftSection={<MdOutlineAirlineSeatReclineNormal />}
            leftSectionPointerEvents="none"
            data={seatTypes}
            value={seat}
            onChange={(e) => setSeat(e.currentTarget.value)}
            data-testid="search-seat-type-select"
          />

          <Button
            variant="outline"
            onClick={() => setUseBackend(!useBackend)}
            size="compact-sm"
            data-testid="search-toggle-typeahead-button"
          >
            {useBackend ? "Switch To WebUI Typeahead" : "Switch To FlightSearch Typeahead"}
          </Button>
        </Group>

        <Grid my="sm" justify="center" align="center">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group grow>
              <Autocomplete
                required
                leftSection={<MdFlightTakeoff />}
                leftSectionPointerEvents="none"
                placeholder="From?"
                renderOption={renderAirportOption}
                data={airportOptions}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={from}
                onChange={setFrom}
                data-testid="search-from-input"
              />

              <Autocomplete
                required
                leftSection={<MdFlightLand />}
                leftSectionPointerEvents="none"
                placeholder="To?"
                renderOption={renderAirportOption}
                data={airportOptions}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={to}
                onChange={setTo}
                data-testid="search-to-input"
              />
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            {trip === "Round Trip" && (
              <DatePickerInput
                required
                type="range"
                clearable={false}
                leftSection={<BsCalendarWeek />}
                leftSectionPointerEvents="none"
                firstDayOfWeek={0}
                value={tripDate}
                // Mantine DatePickerInput range typing is broad; we normalize to Date tuple.
                onChange={(input) => setTripDate(input as [Date, Date])}
                data-testid="search-trip-range-input"
              />
            )}

            {trip === "One Way" && (
              <DatePickerInput
                required
                clearable={false}
                leftSection={<BsCalendarWeek />}
                leftSectionPointerEvents="none"
                firstDayOfWeek={0}
                value={tripDate[0]}
                onChange={(input) => {
                  const oneWayDate = input as Date;
                  setTripDate([
                    oneWayDate,
                    new Date(oneWayDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                  ]);
                }}
                data-testid="search-trip-date-input"
              />
            )}
          </Grid.Col>
        </Grid>

        <Group my="sm" justify="center">
          <Button
            leftSection={<BsSearch />}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            type="submit"
            loading={loading}
            data-testid="search-submit-button"
          >
            Search
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Search;
