#!/bin/sh
# entrypoint.sh

npm run prisma:migrate:prod

# Start the application
npm run start --host 0.0.0.0
