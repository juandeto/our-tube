#!/bin/sh
# entrypoint.sh

npm prisma migrate deploy

# Start the application
npm run start --host 0.0.0.0
