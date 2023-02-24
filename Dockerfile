FROM node:18.14
FROM mcr.microsoft.com/playwright:v1.30.0-focal

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN npm i

CMD ["npx", "ts-node", "app.ts"]