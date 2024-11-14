FROM ghcr.io/puppeteer/puppeteer:23.8.0

WORKDIR /wind

COPY package.json .
RUN npm install && mkdir data

COPY puppet.mjs .
