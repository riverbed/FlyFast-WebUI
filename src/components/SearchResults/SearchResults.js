import { useState, useEffect } from 'react';
import { Stepper } from "@mantine/core";
import { ImAirplane, ImHome, ImCart } from "react-icons/im";

import Results from './Results';
import Cart from '../Cart/Cart';

const SearchResults = ({ fromData, toData, results }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [results])

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="xs">
      <Stepper.Step label="Destination Flights" description={fromData + " - " + toData} icon={<ImAirplane />}>
        <Results fromData={fromData} toData={toData} resultsData={results[0]} />
      </Stepper.Step>
      {results.length === 2 && 
        <Stepper.Step label="Return Flights" description={toData + " - " + fromData} icon={<ImHome />}>
          <Results fromData={toData} toData={fromData} resultsData={results[1]} />
        </Stepper.Step>
      }
      <Stepper.Step label="Cart" description="Total Flights" icon={<ImCart />}>
        <Cart checkoutButton={true} />
      </Stepper.Step>
    </Stepper>
  );
}

export default SearchResults;