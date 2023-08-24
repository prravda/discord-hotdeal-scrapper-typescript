FROM node:18.17.1 as build

WORKDIR /app
COPY  package.json package-lock.json ./

RUN npm install --omit=dev \
    --strict-peer-deps --loglevel verbose && \
    rm -rf /root/.cache && rm -rf /root/.npm
COPY . /app

FROM mcr.microsoft.com/playwright:v1.37.0-jammy as execution
WORKDIR /app
COPY --from=build /app /app

CMD ["npx", "ts-node", "app.ts"]