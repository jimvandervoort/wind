FROM ghcr.io/puppeteer/puppeteer:23.8.0

WORKDIR /wind

COPY package.json package-lock.json ./
RUN npm ci --only=production

ARG VITE_WIND_VERSION
ENV VITE_WIND_VERSION=${VITE_WIND_VERSION}

COPY src src/
COPY fetch fetch/

CMD ["node", "fetch/fetch.mjs"]
