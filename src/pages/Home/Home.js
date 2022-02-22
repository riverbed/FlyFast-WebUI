import { useState } from 'react';
import { Button, Text, Group } from "@mantine/core";

import Searchbar from '../../components/Searchbar/Searchbar';

const Home = () => {
  const [result, setResult] = useState('');

  function handleClick(e) {
    e.preventDefault();
    let url = "/searchflight?from=JFK&to=LAX";
    fetch(url)
      .then(res => res.json())
      .then(
        result => {
          setResult(result);
        }
      )
  }

  return (
    <>
      <Group>
        <Button 
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
          onClick={handleClick}
        >
          Search JFK To LAX
        </Button>
      </Group>
      <Searchbar 
        dataChange={(dataChange) => setResult(dataChange)}
      />
      <Text>
        {result}
      </Text>
    </>
  );
}

export default Home;