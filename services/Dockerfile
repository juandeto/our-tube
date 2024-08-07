FROM node:20.11.1-alpine3.19 AS build

# Install required packages
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /usr/src/app

# Copy the secrets script and entrypoint script first
COPY /services/db-secrets.sh /usr/src/app/db-secrets.sh
COPY /services/entrypoint.sh /usr/src/app/entrypoint.sh

# Make the scripts executable
RUN chmod +x /usr/src/app/db-secrets.sh /usr/src/app/entrypoint.sh

# Source the db-secrets.sh script
RUN . /usr/src/app/db-secrets.sh


# Copy the rest of the application code
COPY /services .

# Install app dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Expose the application port  
EXPOSE 8080

# Start the application
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

