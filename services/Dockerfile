FROM node:20.11.1-alpine3.19 AS build

# Install required packages
RUN apk add --no-cache openssl
# Set the working directory
WORKDIR /usr/src/app

# Copy the rest of the application code
COPY /services .


# Install app dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

COPY /services/entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Expose the application port  
EXPOSE 8080

# Start the application
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]