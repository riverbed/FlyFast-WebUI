import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Group, Button, Paper, NativeSelect, Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { BsCalendarWeek, BsSearch } from "react-icons/bs";
import { MdAirplanemodeActive, MdOutlineAirlineSeatReclineNormal, MdFlightLand, MdFlightTakeoff } from "react-icons/md";

import airports from './AirportsData.json';
import seatTypes from './SeatData.json';
import tripTypes from './TripData.json';

import { airportFilter, airportInformation, airportBackendFilter } from './AirportInformation';

import { airportTypeAhead } from '../../services/Flight';

const Search = ({ fromData, toData, seatData, tripDateData }) => {
  const [loading, setLoading] = useState(false);
  const [useBackend, setUseBackend] = useState(false);
  const [airportData, setAirportData] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trip, setTrip] = useState('Round Trip');
  const [seat, setSeat] = useState('Economy');
  const [tripDate, setTripDate] = useState([
    new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)), 
    new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000))
  ]);
  const LIMITSET = 5;
  const navigate = useNavigate();

  useEffect(() => {
    setFrom(fromData ? fromData : '');
    setTo(toData ? toData : '');
    setSeat(seatData ? seatData : 'Economy');
    setTrip(tripDateData ? (tripDateData[1] ? 'Round Trip' : 'One Way') : 'Round Trip');
    setTripDate(tripDateData ? 
      [
        new Date(tripDateData[0]), 
        tripDateData[1] ? new Date(tripDateData[1]) : new Date(new Date(tripDateData[0]).getTime() + (7 * 24 * 60 * 60 * 1000))
      ]
      :
      [ 
        new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)), 
        new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000))
      ]);
  }, [fromData, toData, seatData, tripDateData])

  useEffect(() => {
    if (useBackend) {
      airportTypeAhead( from, LIMITSET )
      .then( result => {
        setAirportData(result)
      })
      .catch( error => console.error(error));
    }
  }, [from, useBackend])

  useEffect(() => {
    if (useBackend) {
      airportTypeAhead( to, LIMITSET )
      .then( result => {
        setAirportData(result)
      })
      .catch( error => console.error(error));
    }
  }, [to, useBackend])

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const endpoint = `/searchflight`;
    const location = `?from=${from}&to=${to}`;
    let formattedDepartureDate = (tripDate[0].getMonth() + 1) + '-' + tripDate[0].getDate() + '-' + tripDate[0].getFullYear();
    let departureDate = `&departure=${formattedDepartureDate}`;
    let returnDate = '';
    const seating = `&seat=${seat}`;

    if (trip === 'Round Trip'){
      let formattedReturnDate = (tripDate[1].getMonth() + 1) + '-' + tripDate[1].getDate() + '-' + tripDate[1].getFullYear();
      returnDate = `&return=${formattedReturnDate}`;
    }
    
    const URI = endpoint + location + departureDate + returnDate + seating;
    navigate(URI);

    setLoading(false);
  }

  return (
    <Paper
      p='lg'
      shadow='sm'
      withBorder
    >
      <form onSubmit={handleSubmit}>
        <Group my="sm">
          <NativeSelect
            required
            icon={<MdAirplanemodeActive />}
            data={tripTypes}
            value={trip}
            onChange={(e) => setTrip(e.currentTarget.value)}
          />

          <NativeSelect
            required
            icon={<MdOutlineAirlineSeatReclineNormal />}
            data={seatTypes}
            value={seat}
            onChange={(e) => setSeat(e.currentTarget.value)}
          />

          <Button
            variant="outline"
            onClick={() => setUseBackend(!useBackend)}
            compact
          >
            {useBackend ?
              "Switch To WebUI Typeahead"
              :
              "Switch To FlightSearch Typeahead"
            }
          </Button>
        </Group>
        <Grid my="sm" justify="center" align="center">
          <Grid.Col md={8} sm={12}>
            <Group grow>
              <Autocomplete
                required
                icon={<MdFlightTakeoff />}
                placeholder="From?"
                itemComponent={airportInformation}
                data={useBackend ? airportData : airports}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={from}
                onChange={setFrom}
              />

              <Autocomplete
                required
                icon={<MdFlightLand />}
                placeholder="To?"
                itemComponent={airportInformation}
                data={useBackend ? airportData : airports}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={to}
                onChange={setTo}
              />
            </Group>
          </Grid.Col>
          <Grid.Col md={4} sm={12}>
            { trip === "Round Trip" &&
              <DatePickerInput
                required
                type="range"
                clearable={false}
                icon={<BsCalendarWeek />}
                placeholder="Pick Trip Range"
                amountOfMonths={2}
                firstDayOfWeek="sunday"
                value={tripDate}
                onChange={setTripDate}
              />
            }
            { trip === "One Way" &&
              <DatePickerInput
                required
                clearable={false}
                icon={<BsCalendarWeek />}
                placeholder="Pick Trip Date"
                amountOfMonths={1}
                firstDayOfWeek="sunday"
                value={tripDate[0]}
                onChange={(input) => setTripDate([input, new Date(input.getTime() + (7 * 24 * 60 * 60 * 1000))])}
              />
            }
          </Grid.Col>
        </Grid>
        <Group my="sm" position="center">
          <Button
            leftIcon={<BsSearch />}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            type="submit"
            loading={loading}
          >
            Search
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default Search;