import { render } from "@testing-library/react";
import App from "./App";

test("renders app shell title", () => {
  const { getByText } = render(<App />);
  expect(getByText(/flyfast/i)).toBeInTheDocument();
});
