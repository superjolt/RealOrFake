FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pyproject.toml ./

# Install Node.js dependencies
RUN npm ci

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Copy application code
COPY . .
COPY src/ ./src/

# Create directory for backups
RUN mkdir -p backups

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Use a script to start both Node.js and Python processes
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]