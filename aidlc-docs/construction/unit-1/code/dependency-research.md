# Dependency Research - Unit 1

## Summary
Dependency targets were selected using installed-state `npm outdated` output, preferring stable patch/minor versions that preserve current major compatibility for Unit 1.

## Category 1: Core Framework
- react: `^18.3.1` (kept on React 18 for compatibility)
- react-dom: `^18.3.1` (matched React)
- react-router-dom: `^6.30.3` (latest v6 stable branch)

## Category 2: UI Libraries
- @mantine/core: `^6.0.22` (latest v6 stable)
- @mantine/dates: `^6.0.22` (match core)
- @mantine/hooks: `^6.0.22` (match core)
- react-icons: `^5.6.0`

## Category 3: Build Tools and Type Definitions
- typescript: `^5.9.3`
- react-scripts: `^5.0.1` (kept for CRA compatibility)
- @types/node: `^24.4.0`
- @types/react: `^18.3.12`
- @types/react-dom: `^18.3.1`

## Category 4: Utilities
- http-proxy-middleware: `^3.0.5`

## Category 5: Observability
- @opentelemetry/api: `^1.9.0` (already current)
- @opentelemetry/context-zone: `^1.30.1`
- @opentelemetry/exporter-trace-otlp-http: `^0.54.2`
- @opentelemetry/instrumentation: `^0.54.2`
- @opentelemetry/instrumentation-document-load: `^0.41.0`
- @opentelemetry/instrumentation-fetch: `^0.54.2`
- @opentelemetry/instrumentation-user-interaction: `^0.41.0`
- @opentelemetry/instrumentation-xml-http-request: `^0.54.2`
- @opentelemetry/propagator-b3: `^1.30.1`
- @opentelemetry/resources: `^1.30.1`
- @opentelemetry/sdk-trace-base: `^1.30.1`
- @opentelemetry/sdk-trace-web: `^1.30.1`

## Category 6: Testing and Metrics
- web-vitals: `^5.1.0`

## Rationale
- Unit 1 avoids major jumps that trigger UI/API breaks.
- React 19, Mantine 8, and react-router-dom 7 are intentionally deferred.
- Unit 3 remains responsible for major UI framework migration.
