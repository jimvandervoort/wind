FROM ghcr.io/puppeteer/puppeteer:23.8.0

WORKDIR /wind

COPY package.json .
RUN npm install && mkdir data

ARG VITE_WIND_VERSION
ENV VITE_WIND_VERSION=${VITE_WIND_VERSION}

COPY puppet.mjs region.mjs .
