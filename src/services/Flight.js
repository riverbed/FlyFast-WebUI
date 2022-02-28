export async function searchFlight(from, to) {
  const URI = `/flightsearchapi/searchflight?from=${from}&to=${to}`;
  const response = await fetch(URI);
  return response.json();
}