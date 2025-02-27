ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=20.12.2
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim AS base

WORKDIR /usr/src/app

# Copy package files
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/ui ./packages/ui/
COPY apps/web/prisma ./apps/web/prisma/

# Install dependencies
RUN bun install --no-cache

# Generate Prisma client
RUN bun prisma generate --schema=apps/web/prisma/schema.prisma

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=3000

# Expose port 3000 for the app
EXPOSE 3000

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

CMD ["bun", "run", "dev"]
