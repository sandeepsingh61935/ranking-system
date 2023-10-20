# Step 1: Build the application
FROM node:16-alpine AS prod

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install pm2 -g
# Bundle app source
COPY . .

RUN  npm run build

EXPOSE 3000


CMD [ "pm2-runtime", "start", "prod.ecosystem.config.cjs" ]