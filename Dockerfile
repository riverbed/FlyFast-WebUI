# Stage 1, Building React Application
FROM node:12.18.1 as react-build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Stage 2, Setting Up Production Environment

FROM nginx:1.19.6

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=react-build /app/build /usr/share/nginx/html

ENV REACT_APP_FLIGHT_SEARCH http://Search:8080
ENV REACT_APP_OPENTELEMETRY_ENDPOINT http://apm-collector:55681

EXPOSE 80

CMD /bin/bash -c "envsubst '\$REACT_APP_FLIGHT_SEARCH \$REACT_APP_OPENTELEMETRY_ENDPOINT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" 