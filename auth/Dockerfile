FROM node:12.17-alpine3.10
WORKDIR /app
COPY package.json .
RUN npm install --only=prod
COPY . .
CMD [ "npm", "start" ]