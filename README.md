# FlyFast - WebUI

This repository contains the source code for the WebUI of FlyFast.

For the source code of the backend, head over to [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch). This will be necessary to make any backend calls but is not required for viewing the WebUI.

To view the full source code and to run the whole application through Docker, head over to [FlyFast](https://github.com/Aternity/FlyFast).

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite 6** (build tool and dev server)
- **Vitest 3** (test runner)
- **Mantine 8** (UI components)
- **React Router 7** (routing)
- **OpenTelemetry** (tracing)

## Prerequisites

1. [Git](https://git-scm.com/) (Optional)
2. A Docker host, for example [Docker Desktop](https://www.docker.com/products/docker-desktop) (Optional)
3. [Node.js 20+](https://nodejs.org/en/) (Required)
4. [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch) (Required only for backend calls)

## Getting Started

1. Clone/download this repository.
    ```
    git clone https://github.com/Aternity/FlyFast-WebUI.git
    ```
2. Using the terminal, change the directory to the folder of this project.
    ```
    cd FlyFast-WebUI
    ```
3. You can either start the application using [Node.js](#step-by-step-using-nodejs) or [Docker](#step-by-step-using-docker).

## Step by Step Using NodeJS

1. Install the dependencies required to run this application:
    ```
    npm install
    ```
2. Set the environment variables for the application. Copy [.env.example](.env.example) to `.env` and fill in the values.
    - `VITE_FLIGHT_SEARCH` — the Flight Search URL (default port `8080`), used if you are running [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch).
    - `VITE_OPENTELEMETRY_ENDPOINT` — the APM Collector URL (default port `55681`), used if you are running the [Aternity APM Collector](https://hub.docker.com/r/aternity/apm-collector).

    Environment variables are accessed in source code via `import.meta.env.VITE_*`.

3. Select one of the following [scripts](#available-scripts) that best suits your purpose.

## Step by Step Using Docker

1. Build the Docker image:
    ```
    docker build . -t flyfast-webui
    ```
2. Run the container:
    ```
    docker run --rm -p 80:80 -e VITE_FLIGHT_SEARCH=http://localhost:8080 -e VITE_OPENTELEMETRY_ENDPOINT=http://localhost:55681 flyfast-webui
    ```
3. Open [http://localhost:80](http://localhost:80) to view it in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode using Vite.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page hot-reloads when you make changes.

### `npm test`

Runs the Vitest test suite once and reports results.

### `npm run test:watch`

Runs Vitest in watch mode, re-running affected tests on file changes.

### `npm run test:ui`

Opens the Vitest browser UI for interactive test inspection.

### `npm run build`

Builds the app for production into the `dist/` folder.\
The build is minified and filenames include content hashes.

### `npm run preview`

Serves the production build from `dist/` locally for inspection before deployment.

### `npm run type-check`

Runs TypeScript validation without emitting build artifacts.

## Docker Build Notes

The Dockerfile uses a multi-stage build:
- **Build stage**: Node 22 Alpine — installs dependencies and runs `vite build` (output in `dist/`)
- **Runtime stage**: NGINX 1.27 Alpine — serves the static assets; injects `VITE_*` environment variables at container startup via `envsubst`

Build image:

```bash
docker build -t flyfast-webui .
```

Run container:

```bash
docker run --rm -p 80:80 -e VITE_FLIGHT_SEARCH=http://localhost:8080 -e VITE_OPENTELEMETRY_ENDPOINT=http://localhost:55681 flyfast-webui
```

## License
Copyright (c) 2022 Riverbed Technology, Inc.

The contents provided here are licensed under the terms and conditions of the MIT License accompanying the software ("License"). The scripts are distributed "AS IS" as set forth in the License. The script also include certain third party code. All such third party code is also distributed "AS IS" and is licensed by the respective copyright holders under the applicable terms and conditions (including, without limitation, warranty and liability disclaimers) identified in the license notices accompanying the software.
