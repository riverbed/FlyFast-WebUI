# Docker Build Guide - Unit 1

## Build

```bash
docker build -t flyfast-webui:unit1 .
```

## Run

```bash
docker run --rm -p 80:80 -e REACT_APP_FLIGHT_SEARCH=http://localhost:8080 -e REACT_APP_OPENTELEMETRY_ENDPOINT=http://localhost:55681 flyfast-webui:unit1
```

## Health Check

```bash
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

## Notes
- Runtime image serves static build through NGINX.
- Build stage pins Node/npm for reproducibility.
- Existing ALLUVIO tag injection behavior is preserved.
