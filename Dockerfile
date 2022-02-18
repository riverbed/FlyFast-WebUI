FROM node:12.18.1
ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]
