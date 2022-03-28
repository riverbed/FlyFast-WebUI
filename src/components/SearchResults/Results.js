import NoResults from './NoResults';
import TripCard from '../TripCard/TripCard';

const Results = ({ fromData, toData, resultsData }) => {
  return (
    <>
      {resultsData.length === 0 ?
        <NoResults fromData={fromData} toData={toData} />
      :
        resultsData.map((trip, index) => (
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
    </>
  );
}

export default Results;