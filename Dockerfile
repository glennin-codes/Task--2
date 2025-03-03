FROM node:18-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

# Build TypeScript code
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Remove source code and build tools to reduce image size
RUN rm -rf tsconfig.json

EXPOSE 8080

CMD ["node", "dist/index.js"]