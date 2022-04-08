import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stepper, Button, Center } from "@mantine/core";
import { MdOutlineAirplaneTicket, MdHome } from "react-icons/md";
import { BsFillCartFill } from 'react-icons/bs';

import Results from './Results';
import Cart from '../Cart/Cart';

const SearchResults = ({ fromData, toData, results }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [results])

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="xs">
      <Stepper.Step label="Destination Flights" description={fromData + " - " + toData} icon={<MdOutlineAirplaneTicket />}>
        <Results fromData={fromData} toData={toData} resultsData={results[0]} />
      </Stepper.Step>
      {results.length === 2 && 
        <Stepper.Step label="Return Flights" description={toData + " - " + fromData} icon={<MdHome />}>
          <Results fromData={toData} toData={fromData} resultsData={results[1]} />
        </Stepper.Step>
      }
      <Stepper.Step label="Cart" description="Total Flights" icon={<BsFillCartFill />}>
        <Cart />
        <Center>
          <Button
            leftIcon={<BsFillCartFill />}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            component={Link}
            to="/checkout"
          >
            Proceed To Checkout
          </Button>
        </Center>
      </Stepper.Step>
    </Stepper>
  );
}

export default SearchResults;