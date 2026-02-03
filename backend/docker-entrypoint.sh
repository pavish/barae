#!/bin/sh
set -e

# Run database migrations if MIGRATE_ON_START is set
if [ "$MIGRATE_ON_START" = "true" ]; then
  echo "Running database migrations..."
  npm run db:migrate:prod
  echo "Migrations complete."
fi

# Execute the main command
exec "$@"
