import { useState, useEffect } from 'react';
import { Autocomplete, Group, Button, Paper, NativeSelect, Grid } from '@mantine/core';
import { DateRangePicker, DatePicker } from '@mantine/dates';
import { FaPlaneArrival, FaPlaneDeparture, FaSearch } from "react-icons/fa";
import { BsCalendarWeek } from "react-icons/bs";
import { MdAirplanemodeActive, MdOutlineAirlineSeatReclineNormal } from "react-icons/md";

import { airportBackendFilter, airportBackendInformation } from './AirportInformation';
import { searchFlight, airportTypeAhead } from '../../services/Flight';

const SearchBackend = ({ dataChange }) => {
  const [loading, setLoading] = useState(false);
  const [airportData, setAirportData] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trip, setTrip] = useState('Round Trip');
  const [seat, setSeat] = useState('Economy');
  const [roundTripDate, setRoundTripDate] = useState([]);
  const [oneWayDate, setOneWayDate] = useState('');

  useEffect(() => {
    if(!from){
      return setAirportData([]);
    }
    const limitSet = 5;
    airportTypeAhead( from, limitSet )
    .then( result => {
      setAirportData(result)
    })
    .catch( error => console.error(error));
  }, [from])

  useEffect(() => {
    if(!to){
      return setAirportData([]);
    }
    const limitSet = 5;
    airportTypeAhead( to, limitSet )
    .then( result => {
      setAirportData(result)
    })
    .catch( error => console.error(error));
  }, [to])

  useEffect(() => {
    const today = new Date();
    let useDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

    if (trip === 'One Way'){
      if (roundTripDate[0]) {
        useDate = roundTripDate[0];
      }
      setOneWayDate(useDate);
    }
    else if (trip === 'Round Trip'){
      if (oneWayDate) {
        useDate = oneWayDate;
      }
      let nextDate = new Date(useDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      setRoundTripDate([useDate, nextDate]);
    }
  }, [trip])

  const tripTypes = [
    { value: 'One Way', label: 'One Way' },
    { value: 'Round Trip', label: 'Round Trip' }
  ];

  const seatTypes = [
    { value: 'Economy', label: 'Economy' },
    { value: 'Premium Economy', label: 'Premium Economy' },
    { value: 'Business', label: 'Business' },
    { value: 'First', label: 'First' }
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (trip === 'One Way'){
      await searchFlight(from, to, oneWayDate, '', seat)
      .then( result => {
        dataChange(JSON.stringify(result));
      })
      .catch( error => console.error(error));
    }
    else if (trip === 'Round Trip'){
      await searchFlight(from, to, roundTripDate[0], roundTripDate[1], seat)
      .then( result => {
        dataChange(JSON.stringify(result));
      })
      .catch( error => console.error(error));
    }
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
                itemComponent={airportBackendInformation}
                data={airportData}
                filter={airportBackendFilter}
                value={from}
                onChange={setFrom}
              />

              <Autocomplete
                required
                icon={<FaPlaneArrival />}
                placeholder="To?"
                itemComponent={airportBackendInformation}
                data={airportData}
                filter={airportBackendFilter}
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
                value={roundTripDate}
                onChange={setRoundTripDate}
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
                value={oneWayDate}
                onChange={setOneWayDate}
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

export default SearchBackend;