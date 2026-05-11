FROM node:26-alpine AS react-build

# Pin npm for reproducible dependency behavior across local and CI builds.
RUN npm install -g npm@11.7.0

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npm run build
RUN npm prune --production

FROM nginx:1.27.0-alpine

RUN apk add --no-cache curl gettext

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=react-build /app/dist /usr/share/nginx/html

ENV VITE_FLIGHT_SEARCH="http://flyfast-flightsearch:8080"
ENV VITE_OPENTELEMETRY_ENDPOINT="http://apm-collector:55681"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD curl -f http://localhost/ || exit 1

LABEL maintainer="FlyFast Development Team"
LABEL description="FlyFast Web UI static frontend"

## Initial command to launch the app
# CMD ["/bin/sh", "-c", "envsubst '$VITE_FLIGHT_SEARCH $VITE_OPENTELEMETRY_ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

## Command modified to add Observability with ALLUVIO UJI
# * The head of the index.html must contain the TAG PLACEHOLDER defined in the env variable ALLUVIO_TAG_PLACEHOLDER
# * in order to inject ALLUVIO_UJI_TAG in the index.html master page of the app
# * ALLUVIO_UJI_TAG must be configured at runtime (ex. )
ENV ALLUVIO_TAG_PLACEHOLDER="<alluvio_tag_placeholder\/>"
ENV ALLUVIO_UJI_TAG="<!-- my ALLUVIO UJI TAG -->"
CMD ["/bin/sh", "-c", "sed -i \"s|$ALLUVIO_TAG_PLACEHOLDER|$ALLUVIO_UJI_TAG|\" /usr/share/nginx/html/index.html && envsubst '$VITE_FLIGHT_SEARCH $VITE_OPENTELEMETRY_ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]