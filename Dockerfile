FROM node:18.16.0-slim
FROM mcr.microsoft.com/playwright:v1.34.3-jammy

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN npm i

CMD ["npx", "ts-node", "app.ts"]