import Flight from '../Flight/Flight';

const FlightDetails = ({ flights }) => {
  return (
    flights.map((flight, index) => (
      <div key={index}>
        <Flight index={index} flight={flight} addCart={false} />
      </div>
    ))
  )
}

export default FlightDetails;