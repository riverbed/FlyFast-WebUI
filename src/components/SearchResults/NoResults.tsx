/**
 * Purpose: This file (NoResults.tsx) supports the SearchResults area of the FlyFast booking workflow.
 */
import { Center } from "@mantine/core";

interface NoResultsProps {
  fromData: string;
  toData: string;
}

const NoResults = ({ fromData, toData }: NoResultsProps) => {
  return (
    <>
      <Center>There are currently no trips that goes from {fromData} to {toData}.</Center>
      <Center>Please try again later.</Center>
    </>
  );
};

export default NoResults;
