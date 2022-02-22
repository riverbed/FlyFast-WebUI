import { useState } from 'react';
import { TextInput, Group, Button, Paper, LoadingOverlay } from '@mantine/core';

const Searchbar = () => {
  const [overlayShow, setOverlayShow] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  return (
    <Paper
      padding='lg'
      shadow='sm'
    >
      <form>
        <LoadingOverlay visible={overlayShow} />
        <Group grow>
          <TextInput
            required
            placeholder="From?"
            value={from}
            onChange={(e) => setFrom(e.currentTarget.value)}
          />

          <TextInput
            required
            placeholder="To?"
            value={to}
            onChange={(e) => setTo(e.currentTarget.value)}
          />
        </Group>
        <Group mt="xl">
          <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
            Search
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default Searchbar;