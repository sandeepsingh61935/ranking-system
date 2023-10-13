FROM node:16.20.0-alpine 

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#how to use .env file


# Install app dependencies
COPY package.json .
RUN npm install -D
RUN npm install pm2 -g
# Bundle app source
COPY . .
EXPOSE 8000

CMD [ "pm2-runtime", "start", "dev.ecosystem.config.cjs" ]