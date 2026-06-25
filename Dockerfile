# Use official Node.js LTS Alpine image (lightweight)
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (allows Docker to cache the npm install layer)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "app.js"]
