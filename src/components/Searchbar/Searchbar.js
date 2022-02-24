import { useState } from 'react';
import { Autocomplete, Group, Button, Paper, LoadingOverlay, NativeSelect } from '@mantine/core';
import { DateRangePicker, DatePicker } from '@mantine/dates';

import airports from './Airports.json';
import { searchFlight } from '../../services/Flight';

const Searchbar = ({ dataChange }) => {
  const today = new Date();

  const [overlayShow, setOverlayShow] = useState(false);
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

  function handleSubmit(e) {
    e.preventDefault();
    searchFlight(from, to)
      .then( result => {
        dataChange(JSON.stringify(result));
      })
  }

  return (
    <Paper
      padding='lg'
      shadow='sm'
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={overlayShow} />
        <Group my="sm">
          <NativeSelect
            required
            data={tripTypes}
            value={trip}
            onChange={(e) => setTrip(e.currentTarget.value)}
          />

          <NativeSelect
            required
            data={seatTypes}
            value={seat}
            onChange={(e) => setSeat(e.currentTarget.value)}
          />
        </Group>
        <Group grow my="sm">
          <Autocomplete
            required
            placeholder="From?"
            data={airports}
            value={from}
            onChange={setFrom}
          />

          <Autocomplete
            required
            placeholder="To?"
            data={airports}
            value={to}
            onChange={setTo}
          />
          { trip === "Round Trip" &&
            <DateRangePicker
              placeholder="Pick Trip Range"
              amountOfMonths={2}
              firstDayOfWeek="sunday"
              value={roundTripDate}
              onChange={setRoundTripDate}
            />
          }
          { trip === "One Way" &&
            <DatePicker
              placeholder="Pick Trip Date"
              amountOfMonths={1}
              firstDayOfWeek="sunday"
              value={oneWayDate}
              onChange={setOneWayDate}
            />
          }
        </Group>
        <Group my="sm" position="center">
          <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} type="submit">
            Search
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default Searchbar;