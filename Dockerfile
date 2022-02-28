# Stage 1, Building React Application
FROM node:12.18.1 as react-build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Stage 2, Setting Up Production Environment

FROM nginx:1.19.6
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=react-build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]