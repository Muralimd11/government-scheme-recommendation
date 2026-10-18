FROM node:22-bullseye-slim

# Install Python3, pip and essentials for ML dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Install Python ML dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build application
RUN npm run build

ENV NODE_ENV=production
ENV PYTHON_PATH=python3

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
