export async function searchFlight(from, to) {
  const URI = `/searchflight?from=${from}&to=${to}`;
  const response = await fetch(URI);
  return response.json();
}