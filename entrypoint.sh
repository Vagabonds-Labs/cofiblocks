#!/bin/sh
set -e

ls -la /usr/src/app/node_modules

# Ensure node_modules directory exists
mkdir -p node_modules/@repo

# Remove broken symlink and recreate it
rm -rf node_modules/@repo/ui
ln -s /usr/src/app/packages/ui node_modules/@repo/ui

# Start the app
exec "$@"
