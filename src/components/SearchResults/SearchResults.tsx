/**
 * Purpose: This file (SearchResults.tsx) supports the SearchResults area of the FlyFast booking workflow.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Stepper, Button, Center } from "@mantine/core";
import { MdOutlineAirplaneTicket, MdHome } from "react-icons/md";
import { BsFillCartFill } from "react-icons/bs";

import Results from "@/components/SearchResults/Results";
import Cart from "@/components/Cart/Cart";
import type { TripResult } from "@/services/Flight";

interface SearchResultsProps {
  fromData: string;
  toData: string;
  results: TripResult[][];
}

const SearchResults = ({ fromData, toData, results }: SearchResultsProps) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [results]);

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep}>
      <Stepper.Step
        label="Destination Flights"
        description={fromData + " - " + toData}
        icon={<MdOutlineAirplaneTicket />}
      >
        <Results fromData={fromData} toData={toData} resultsData={results[0] ?? []} />
      </Stepper.Step>
      {results.length === 2 && (
        <Stepper.Step
          label="Return Flights"
          description={toData + " - " + fromData}
          icon={<MdHome />}
        >
          <Results fromData={toData} toData={fromData} resultsData={results[1] ?? []} />
        </Stepper.Step>
      )}
      <Stepper.Step label="Cart" description="Total Flights" icon={<BsFillCartFill />}>
        <Cart />
        <Center>
          <Button
            leftSection={<BsFillCartFill />}
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan" }}
            component={Link}
            to="/checkout"
            data-testid="search-results-proceed-checkout-button"
          >
            Proceed To Checkout
          </Button>
        </Center>
      </Stepper.Step>
    </Stepper>
  );
};

export default SearchResults;
