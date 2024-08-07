FROM node:20.11.1-alpine3.19 AS build

# Install required packages
RUN apk add --no-cache openssl

# Set the working directory
WORKDIR /usr/src/app

ARG POSTGRES_PASSWORD
ENV POSTGRES_PASSWORD ${POSTGRES_PASSWORD}

# Copy the secrets script and entrypoint script first¿
COPY /services/entrypoint.sh /usr/src/app/entrypoint.sh

# Make the scripts executable
RUN  /usr/src/app/entrypoint.sh

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

