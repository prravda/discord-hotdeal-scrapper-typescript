FROM node:18.16-slim

WORKDIR /app
COPY  package.json package-lock.json ./
RUN npm install --strict-peer-deps --loglevel verbose && \
    rm -rf /root/.cache && rm -rf /root/.npm
COPY . /app

CMD ["npx", "ts-node", "app.ts"]