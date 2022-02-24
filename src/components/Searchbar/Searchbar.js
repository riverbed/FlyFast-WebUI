import { useState } from 'react';
import { Autocomplete, Group, Button, Paper, NativeSelect, Grid } from '@mantine/core';
import { DateRangePicker, DatePicker } from '@mantine/dates';
import { FaPlaneArrival, FaPlaneDeparture, FaSearch } from "react-icons/fa";
import { BsCalendarWeek } from "react-icons/bs";
import { MdAirplanemodeActive, MdOutlineAirlineSeatReclineNormal } from "react-icons/md";

import airports from './Airports.json';
import { searchFlight } from '../../services/Flight';

const Searchbar = ({ dataChange }) => {
  const today = new Date();

  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [trip, setTrip] = useState('Round Trip');
  const [seat, setSeat] = useState('Economy');
  const [roundTripDate, setRoundTripDate] = useState([new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)), new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000))]);
  const [oneWayDate, setOneWayDate] = useState(new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)));

  const tripTypes = [
    { value: 'One Way', label: 'One Way' },
    { value: 'Round Trip', label: 'Round Trip' }
  ];

  const seatTypes = [
    { value: 'Economy', label: 'Economy' },
    { value: 'Premium Economy', label: 'Premium Economy' },
    { value: 'Business', label: 'Business' },
    { value: 'First', label: 'First' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await searchFlight(from, to)
      .then( result => {
        dataChange(JSON.stringify(result));
      })
      .catch( error => console.error(error))
    setLoading(false);
  }

  return (
    <Paper
      padding='lg'
      shadow='sm'
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
                data={airports}
                value={from}
                onChange={setFrom}
              />

              <Autocomplete
                required
                icon={<FaPlaneArrival />}
                placeholder="To?"
                data={airports}
                value={to}
                onChange={setTo}
              />
            </Group>
          </Grid.Col>
          <Grid.Col md={4} sm={12}>
            { trip === "Round Trip" &&
              <DateRangePicker
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

export default Searchbar;