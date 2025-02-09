FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/ ./src/

# Install dependencies
RUN npm install

# Set environment variables
ENV NODE_ENV=production

# Start the bot
CMD ["node", "src/index.js"]
