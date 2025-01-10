ARG REGISTRY=docker.io

FROM ${REGISTRY}/node:20.11.1-alpine3.18 as builder

RUN apk add git

WORKDIR /usr/src/app

RUN npm -g install prisma

COPY package*.json .
 
RUN npm install  --legacy-peer-deps

COPY . . 

RUN prisma generate --schema=./shared/prisma/schema.prisma

ENV NODE_OPTIONS=--max_old_space_size=3072

RUN npx nx run api-gateway:build --skip-nx-cache=true --configuration=production
RUN npx nx run tx-handler:build --skip-nx-cache=true --configuration=production
