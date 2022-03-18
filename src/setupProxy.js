const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Flight Search API
  app.use(
    '/flightsearchapi', // You can pass in an array too eg. ['/api', '/another/path']
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_HOST,
      changeOrigin: true
    })
  );

  // OpenTelemetry Tracing
  app.use(
    '/v1',
    createProxyMiddleware({
      target: process.env.REACT_APP_OPENTELEMETRY_ENDPOINT,
      changeOrigin: true
    })
  );
};