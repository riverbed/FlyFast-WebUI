# Stage 1, Building React Application

FROM node:20.7.0-slim as react-build

WORKDIR /app
COPY . .

## Dependencies

# method 1: install deps from package.json (not immutable)
# RUN npm install

# method 1 with legacy
# RUN npm install --legacy-peer-deps

# method 2: clean-install will install dependencies from the package-lock.json (immutable)
# RUN npm clean-install 

# method 2 with legacy
RUN npm clean-install --legacy-peer-deps

## Build

RUN npm run build

#######################################################################################

# Stage 2, Setting Up Production Environment

FROM nginx:1.25.1

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=react-build /app/build /usr/share/nginx/html

ENV REACT_APP_FLIGHT_SEARCH="http://flyfast-flightsearch:8080"
ENV REACT_APP_OPENTELEMETRY_ENDPOINT="http://apm-collector:55681"

EXPOSE 80

## Initial command to launch the app
# CMD /bin/bash -c "envsubst '\$REACT_APP_FLIGHT_SEARCH \$REACT_APP_OPENTELEMETRY_ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 

## Command modified to add Observability with ALLUVIO UJI
# * The head of the index.html must contain the TAG PLACEHOLDER defined in the env variable ALLUVIO_TAG_PLACEHOLDER
# * in order to inject ALLUVIO_UJI_TAG in the index.html master page of the app
# * ALLUVIO_UJI_TAG must be configured at runtime (ex. )
ENV ALLUVIO_TAG_PLACEHOLDER="<alluvio_tag_placeholder\/>"
ENV ALLUVIO_UJI_TAG="<!-- my ALLUVIO UJI TAG -->"
CMD /bin/bash -c "sed -i \"s|$ALLUVIO_TAG_PLACEHOLDER|$ALLUVIO_UJI_TAG|\" /usr/share/nginx/html/index.html && envsubst '\$REACT_APP_FLIGHT_SEARCH \$REACT_APP_OPENTELEMETRY_ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 