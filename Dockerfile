FROM node:18.16.0-alphine
FROM mcr.microsoft.com/playwright:v1.35.0-jammy

CMD ["npm", "install", "-g", "npm@9.6.7"]

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN npm i

CMD ["npx", "ts-node", "app.ts"]