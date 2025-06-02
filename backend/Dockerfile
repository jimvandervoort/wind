FROM oven/bun:1.2.7 AS base

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "src/server.ts"]
