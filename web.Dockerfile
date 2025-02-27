ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=20.12.2
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim AS base

WORKDIR /usr/src/app/apps/web

# Install build dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package.json bun.lock /usr/src/app/
COPY apps/web/package.json ./
COPY packages/eslint-config/ /usr/src/app/packages/eslint-config/
COPY packages/typescript-config/ /usr/src/app/packages/typescript-config/
COPY packages/ui /usr/src/app/packages/ui/

# Copy Prisma schema
COPY apps/web/prisma ./prisma/

# Install dependencies from root
WORKDIR /usr/src/app
RUN bun install --no-cache

# Generate Prisma Client
WORKDIR /usr/src/app/apps/web
RUN bun prisma generate

# Copy the rest of the application
COPY . /usr/src/app

ENV PORT=3000
ENV NODE_ENV=development

EXPOSE 3000

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["bun", "run", "dev"]
