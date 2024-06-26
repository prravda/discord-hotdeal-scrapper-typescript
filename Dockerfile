FROM node:20.11.1 as build

WORKDIR /app
COPY  package.json package-lock.json ./

RUN apt update && apt install g++ -y && \
    npm install --omit=dev \
    --strict-peer-deps --loglevel verbose && \
    rm -rf /root/.cache && rm -rf /root/.npm

COPY . /app

FROM mcr.microsoft.com/playwright:v1.43.1-jammy as execution
RUN apt-get update &&  \
    apt-get upgrade -y && \
    apt-get install dumb-init
WORKDIR /app
COPY --from=build /app /app

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["npx", "ts-node", "app.ts"]