#!/bin/sh
set -e

echo "🚀 Starting entrypoint script..."

cd /usr/src/app/apps/web

echo "📝 Generating Prisma Client..."
NODE_ENV=development bun prisma generate

echo "🔄 Running Prisma migrations..."
bun prisma migrate deploy

echo "🧹 Cleaning build cache..."
if [ -d ".next" ]; then
  rm -rf .next/* || true
fi

echo "✨ Starting application..."
exec "$@"
