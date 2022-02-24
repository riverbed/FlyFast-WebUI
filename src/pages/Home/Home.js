import { useState } from 'react';
import { Text } from "@mantine/core";

import Searchbar from '../../components/Searchbar/Searchbar';

const Home = () => {
  const [result, setResult] = useState('');

  return (
    <>
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