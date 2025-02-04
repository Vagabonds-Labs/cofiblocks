# Set Bun and Node version
ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=20.12.2
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim AS base

# Stage 1: Install Dependencies
FROM base AS install

# Create the /temp/dev directory to install dependencies
RUN mkdir -p /temp/dev
WORKDIR /temp/dev

# Copy necessary files from the web and packages directories
COPY package.json bun.lock ./
COPY apps/web/package.json apps/web/bun.lockb ./apps/web/
COPY packages/eslint-config/ ./packages/eslint-config/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/ui ./packages/ui/
COPY ./apps/web/prisma ./apps/web/prisma

# Install all dependencies using bun
RUN bun install --ignore-scripts --no-cache --force

# Ensures proper platform SWC binaries are downloaded for Next.js
RUN bun run postinstall || true

RUN bun prisma generate --schema=apps/web/prisma/schema.prisma

# Stage 2: Pre-release (copy from install stage)
FROM base AS prerelease

WORKDIR /usr/src/app

# Copy node_modules and prisma from the install stage
COPY --from=install /temp/dev/node_modules ./node_modules
COPY --from=install /temp/dev/apps/web/prisma ./apps/web/prisma
COPY --from=install /temp/dev/apps/web/package.json ./apps/web/package.json
COPY --from=install /temp/dev/bun.lockb ./bun.lockb

# Copy the entire workspace (important for monorepos)
COPY . .

# Stage 3: Release (final stage)
FROM base AS release
WORKDIR /usr/src/app

# Copy everything from the previous stage (pre-release) to the final release stage
COPY --from=prerelease /usr/src/app /usr/src/app

# Ensure dependencies are available
RUN bun install --no-cache --force

# Set environment variables
ENV PORT=3000

# Expose port 3000 for the app
EXPOSE 3000

COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Command to start the app using bun
CMD ["bun", "run", "dev", "--hostname", "0.0.0.0"]
