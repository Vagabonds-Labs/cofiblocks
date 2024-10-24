# Set Bun and Node version
ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=20.12.2
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim AS base

WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
WORKDIR /temp/dev
COPY ./apps/web/package.json ./apps/web/bun.lockb ./
COPY ./packages/eslint-config/ ./node_modules/@repo/eslint-config/
COPY ./packages/typescript-config/ ./node_modules/@repo/typescript-config/
COPY ./packages/ui/ ./node_modules/@repo/ui/
COPY ./apps/web/prisma/ ./prisma/
# TODO: Remove the || true to use trustedDependencies so bun
# can install the dependencies without error
# RUN bun install
# RUN bun install --frozen-lockfile || true
# RUN bun pm trust --all

# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY --from=install /temp/dev/prisma prisma
# COPY . .

# FROM base AS release
# COPY --from=install /temp/dev/node_modules node_modules
# COPY --from=prerelease /usr/src/app/index.ts .
# COPY --from=prerelease /usr/src/app/package.json .

# COPY ./apps/web/ .


# CMD ["bun", "run", "dev"]