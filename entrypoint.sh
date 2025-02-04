#!/bin/sh
set -e

# Remove broken symlink and recreate it
rm -rf node_modules/@repo/ui
ln -s /usr/src/app/packages/ui node_modules/@repo/ui

# Start the app
exec "$@"
