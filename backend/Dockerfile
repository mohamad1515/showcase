FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
