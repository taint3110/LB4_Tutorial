# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-slim

RUN mkdir -p /code

WORKDIR /code

COPY  package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV HOST=0.0.0.0 PORT=3001

EXPOSE ${PORT}
CMD [ "node", "." ]

