FROM node:16-alpine

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install -D
RUN npm install pm2 -g

# Bundle app source
COPY . .

EXPOSE 3000
RUN ls -al

# CMD [ "npm","run","dev"]
CMD [ "pm2-runtime", "start", "dev.ecosystem.config.cjs" ]