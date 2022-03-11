export async function searchFlight( from, to, departureDate, returnDate, seatType ){
  const endpoint = `/flightsearchapi/searchflight`;
  const location = `?from=${from}&to=${to}`;
  const departureTime = `&departure=${departureDate}`;
  let returnTime = '';
  if (returnDate){
    returnTime = `&return=${returnDate}`;
  }
  const seat = `&seat=${seatType}`;
  const URI = endpoint + location + departureTime + returnTime + seat;
  const response = await fetch(URI);
  return response.json();
}

export async function airportTypeAhead( text, limit ){
  if (!text){
    return [];
  }
  const endpoint = `/flightsearchapi/airportypeahead`;
  const search = `?searchtxt=${text}`;
  let limitResult = '';
  if (limit){
    limitResult = `&limit=${limit}`;
  }
  const URI = endpoint + search + limitResult;
  const response = await fetch(URI);
  return response.json();
}