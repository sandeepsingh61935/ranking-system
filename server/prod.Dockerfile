FROM node:16-alpine AS production

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --prod
RUN npm install pm2 -g
# Bundle app source
COPY . .
RUN npm run build


# Show current folder structure in logs
                     
CMD [ "pm2-runtime", "start", "prod.ecosystem.config.cjs" ]