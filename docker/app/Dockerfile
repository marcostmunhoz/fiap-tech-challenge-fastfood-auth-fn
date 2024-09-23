FROM node:20.12.2-alpine3.19 AS base

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

FROM base AS dev

EXPOSE 8080

CMD ["yarn", "start:dev"]