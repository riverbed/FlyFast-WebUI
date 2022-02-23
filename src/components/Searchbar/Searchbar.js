import { useState } from 'react';
import { Autocomplete, Group, Button, Paper, LoadingOverlay } from '@mantine/core';
import airports from './Airports.json';

const Searchbar = ({ dataChange }) => {
  const [overlayShow, setOverlayShow] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const url = `/searchflight?from=${from}&to=${to}`;
    fetch(url)
    .then(res => res.json())
    .then(
      result => {
        dataChange(JSON.stringify(result));
      }
    )
  }

  return (
    <Paper
      padding='lg'
      shadow='sm'
    >
      <form onSubmit={handleSubmit}>
        <LoadingOverlay visible={overlayShow} />
        <Group grow>
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
        </Group>
        <Group mt="xl">
          <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} type="submit">
            Search
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default Searchbar;