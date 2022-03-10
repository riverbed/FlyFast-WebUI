import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Group, Button, Paper, NativeSelect, Grid } from '@mantine/core';
import { DateRangePicker, DatePicker } from '@mantine/dates';
import { FaPlaneArrival, FaPlaneDeparture, FaSearch } from "react-icons/fa";
import { BsCalendarWeek } from "react-icons/bs";
import { MdAirplanemodeActive, MdOutlineAirlineSeatReclineNormal } from "react-icons/md";

import airports from './AirportsData.json';
import seatTypes from './SeatData.json';
import tripTypes from './TripData.json';

import { airportFilter, airportInformation, airportBackendFilter, airportBackendInformation } from './AirportInformation';

import { airportTypeAhead } from '../../services/Flight';

const Search = ({ useBackend }) => {
  const [loading, setLoading] = useState(false);
  const [airportData, setAirportData] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trip, setTrip] = useState('Round Trip');
  const [seat, setSeat] = useState('Economy');
  const [tripDate, setTripDate] = useState([
    new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)), 
    new Date(new Date().getTime() + (14 * 24 * 60 * 60 * 1000))
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    if (useBackend) {
      if (!from){
        return setAirportData([]);
      }
      const limitSet = 5;
      airportTypeAhead( from, limitSet )
      .then( result => {
        setAirportData(result)
      })
      .catch( error => console.error(error));
    }
  }, [from])

  useEffect(() => {
    if (useBackend) {
      if (!to){
        return setAirportData([]);
      }
      const limitSet = 5;
      airportTypeAhead( to, limitSet )
      .then( result => {
        setAirportData(result)
      })
      .catch( error => console.error(error));
    }
  }, [to])

  useEffect(() => {
    if (trip === 'Round Trip'){
      setTripDate([tripDate[0], new Date(tripDate[0].getTime() + (7 * 24 * 60 * 60 * 1000))]);
    }
  }, [trip])

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
      padding='lg'
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
        </Group>
        <Grid my="sm" justify="center" align="center">
          <Grid.Col md={8} sm={12}>
            <Group grow>
              <Autocomplete
                required
                icon={<FaPlaneDeparture />}
                placeholder="From?"
                itemComponent={useBackend ? airportBackendInformation : airportInformation}
                data={useBackend ? airportData : airports}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={from}
                onChange={setFrom}
              />

              <Autocomplete
                required
                icon={<FaPlaneArrival />}
                placeholder="To?"
                itemComponent={useBackend ? airportBackendInformation : airportInformation}
                data={useBackend ? airportData : airports}
                filter={useBackend ? airportBackendFilter : airportFilter}
                value={to}
                onChange={setTo}
              />
            </Group>
          </Grid.Col>
          <Grid.Col md={4} sm={12}>
            { trip === "Round Trip" &&
              <DateRangePicker
                required
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
              <DatePicker
                required
                clearable={false}
                icon={<BsCalendarWeek />}
                placeholder="Pick Trip Date"
                amountOfMonths={1}
                firstDayOfWeek="sunday"
                value={tripDate[0]}
                onChange={setTripDate[0]}
              />
            }
          </Grid.Col>
        </Grid>
        <Group my="sm" position="center">
          <Button
            leftIcon={<FaSearch />}
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