#!/bin/sh
# entrypoint.sh

. /usr/src/app/db-secrets.sh

npm run prisma:migrate:prod

# Start the application
npm run start --host 0.0.0.0
