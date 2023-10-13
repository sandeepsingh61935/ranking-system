# Step 1: Build the application
FROM node:16-alpine AS prod

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production
RUN npm install vite -g 
RUN npm run build
# Bundle app source
COPY . .


EXPOSE 3000
RUN ls -al -R

CMD [ "pm2-runtime", "start", "prod.ecosystem.config.cjs" ]