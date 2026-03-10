import { Card } from "@mantine/core";

import Flight from "../Flight/Flight";
import type { FlightSegment } from "../../services/Flight";

interface FlightDetailsProps {
  flights: FlightSegment[];
  cart: boolean;
}

const FlightDetails = ({ flights, cart }: FlightDetailsProps) => {
  return (
    <>
      {flights.map((flight, index) => (
        <Card radius="md" m="xs" withBorder key={index}>
          <Flight index={index} flight={flight} cart={cart} addCart={false} />
        </Card>
      ))}
    </>
  );
};

export default FlightDetails;
