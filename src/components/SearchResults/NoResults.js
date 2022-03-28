import { Center } from '@mantine/core';

const NoResults = ({ fromData, toData }) => {
  return (
    <>
      <Center>
        There are currently no trips that goes from {fromData} to {toData}. 
      </Center>
      <Center>
        Please try again later.
      </Center>
    </>
  );
}

export default NoResults;