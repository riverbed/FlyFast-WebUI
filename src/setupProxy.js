const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Flight Search API
  app.use( '/flightsearchapi', createProxyMiddleware({
    target: process.env.REACT_APP_FLIGHT_SEARCH,
    changeOrigin: true
  }));

  // OpenTelemetry Tracing
  app.use( '/tracingapi', createProxyMiddleware({
    target: process.env.REACT_APP_OPENTELEMETRY_ENDPOINT,
    changeOrigin: true,
    pathRewrite: {
      "/tracingapi": ""
    }
  }));
};