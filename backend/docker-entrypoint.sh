#!/bin/sh
set -e

# Seed only when the SQLite DB does not exist yet (fresh volume / fresh clone),
# so restarts don't duplicate the demo data.
FRESH=false
[ ! -f database.sqlite ] && FRESH=true

echo "Running migrations..."
npx sequelize-cli db:migrate

if [ "$FRESH" = "true" ]; then
  echo "Fresh database — seeding demo data..."
  npx sequelize-cli db:seed:all
else
  echo "Existing database found — skipping seed."
fi

exec "$@"   # runs CMD: npm run dev (nodemon)
