/**
 * Purpose: This file (App.test.tsx) supports the src area of the FlyFast booking workflow.
 */
import { render } from "@testing-library/react";
import App from "@/App";

test("renders app shell title", () => {
  const { getByText } = render(<App />);
  expect(getByText(/flyfast/i)).toBeInTheDocument();
});
