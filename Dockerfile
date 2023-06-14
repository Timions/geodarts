FROM node:14.7.0-alpine3.12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

EXPOSE 8080
CMD [ "node", "src/app.js" ]