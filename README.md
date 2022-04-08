# FlyFast - WebUI

This repository contains the source code for the WebUI of FlyFast.

For the source code of the backend, head over to [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch). This will be necessary to make any backend calls but is not required for viewing the WebUI.

To view the full source code and to run the whole application through Docker, head over to [FlyFast](https://github.com/Aternity/FlyFast).

## Prerequisites

1. [Git](https://git-scm.com/) (Optional)
2. a Docker host, for example [Docker Desktop](https://www.docker.com/products/docker-desktop) (Optional)
3. [NodeJS](https://nodejs.org/en/) (Required)
4. [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch) (Required Only For Making Backend Calls)

## Getting Started
1. Clone/download this repository.
    ```
    git clone https://github.com/Aternity/FlyFast-WebUI.git
    ```
2. Using the terminal, change the directory to the folder of this project.
    ```
    cd FlyFast-WebUI
    ```

## Step by Step Using NodeJS
1. Install the dependencies required to run this application:
    ```
    npm install
    ```
2. Make sure to set the environment variables for the application. Take a look at [.env.example](.env.example) and follow the instructions on there.
    - `REACT_APP_FLIGHT_SEARCH` is the Flight Search URL, which should be on port `8080`, if you are using the [FlightSearch](https://github.com/Aternity/FlyFast-FlightSearch).
    - `REACT_APP_OPENTELEMETRY_ENDPOINT` is the APM Collector URL, which should be on port `55681`, if you are using the [Aternity APM Collector](https://hub.docker.com/r/aternity/apm-collector)
3. Select one of the following [scripts](#available-scripts) that best suits your purpose.

## Step by Step Using Docker
1. Build our docker:
    ```
    docker build . -t WebUI
    ```
2. Run our docker container:
    ```
    docker run --rm -p 80:80 WebUI
    ```
3. Open [http://localhost:80](http://localhost:80) to view it in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Additional Information

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
