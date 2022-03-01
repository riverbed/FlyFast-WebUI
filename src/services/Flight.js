export async function searchFlight( from, to, departureDate, returnDate, seatType ){
  const endpoint = `/flightsearchapi/searchflight`;
  const location = `?from=${from}&to=${to}`;
  const formattedDepartureDate = (departureDate.getMonth() + 1) + '/' + departureDate.getDate() + '/' + departureDate.getFullYear();
  const departureTime = `&departure=${formattedDepartureDate}`;
  let formattedReturnDate = '';
  let returnTime = '';
  if (returnDate){
    formattedReturnDate = (returnDate.getMonth() + 1) + '/' + returnDate.getDate() + '/' + returnDate.getFullYear();
    returnTime = `&return=${formattedReturnDate}`;
  }
  const seat = `&seat=${seatType}`;
  const URI = endpoint + location + departureTime + returnTime + seat;
  const response = await fetch(URI);
  return response.json();
}

export async function airportTypeAhead( text ){
  const endpoint = `/flightsearchapi/airportypeahead`;
  const search = `?searchtxt=${text}`;
  const URI = endpoint + search;
  const response = await fetch(URI);
  return response.json();
}