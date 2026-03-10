import { createProxyMiddleware } from "http-proxy-middleware";

interface ExpressLikeApp {
  use: (path: string, middleware: unknown) => void;
}

const setupProxy = (app: ExpressLikeApp) => {
  app.use(
    "/flightsearchapi",
    createProxyMiddleware({
      target: process.env.REACT_APP_FLIGHT_SEARCH,
      changeOrigin: true,
    })
  );

  app.use(
    "/tracingapi",
    createProxyMiddleware({
      target: process.env.REACT_APP_OPENTELEMETRY_ENDPOINT,
      changeOrigin: true,
      pathRewrite: {
        "/tracingapi": "",
      },
    })
  );
};

export default setupProxy;
