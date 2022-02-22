import { useState } from 'react';
import { Button, Text } from "@mantine/core";

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
      <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}
        onClick={handleClick}
      >
        Click Me!
      </Button>
      <Text>{result}</Text>
    </>
  );
}

export default Home;