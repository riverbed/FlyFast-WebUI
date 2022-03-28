import { useState } from 'react';
import { Stepper } from "@mantine/core";

import NoResults from './NoResults';
import TripCard from '../TripCard/TripCard';

import { ImAirplane, ImHome, ImCart } from "react-icons/im";

const SearchResults = ({ fromData, toData, results }) => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="xs">
      <Stepper.Step label="Destination Flights" description={fromData + " - " + toData} icon={<ImAirplane />}>
        {results[0].length === 0 ?
          <NoResults fromData={fromData} toData={toData} />
        :
          results[0].map((trip, index) => (
            <TripCard
              key={index}
              from={trip.from}
              to={trip.to}
              flights={trip.flights}
              departureTime={trip.departureTime}
              arrivalTime={trip.arrivalTime}
              fare={trip.fare}
            />
          ))
        }
      </Stepper.Step>
      { results.length === 2 && 
        <Stepper.Step label="Return Flights" description={toData + " - " + fromData} icon={<ImHome />}>
          {results[1].length === 0 ?
            <NoResults fromData={toData} toData={fromData} />
          :
            results[1].map((trip, index) => (
              <TripCard
                key={index}
                from={trip.from}
                to={trip.to}
                flights={trip.flights}
                departureTime={trip.departureTime}
                arrivalTime={trip.arrivalTime}
                fare={trip.fare}
              />
            ))
          }
        </Stepper.Step>
      }
      <Stepper.Step label="Cart" description="Total Flights" icon={<ImCart />}>
        {/* Implement Cart Functionality */}
      </Stepper.Step>
    </Stepper>
  );
}

export default SearchResults;