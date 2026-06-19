FROM ghcr.io/puppeteer/puppeteer:25.1.0

WORKDIR /wind

COPY package.json package-lock.json ./
RUN npm ci --only=production

ARG VITE_WIND_VERSION
ENV VITE_WIND_VERSION=${VITE_WIND_VERSION}

COPY src src/
COPY fetch fetch/

CMD ["node", "fetch/fetch.mjs"]
