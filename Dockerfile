FROM node:12.18.1
ENV NODE_ENV=production
ENV REACT_APP_PROXY_HOST=http://Search:8080

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
