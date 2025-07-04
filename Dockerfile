# Use Node 22 as the base image
FROM node:22-alpine

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
