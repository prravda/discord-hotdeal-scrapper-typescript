FROM mcr.microsoft.com/playwright:v1.37.0-jammy

WORKDIR /app
COPY  package.json package-lock.json ./
RUN npm install --omit=dev \
    --strict-peer-deps --loglevel verbose && \
    rm -rf /root/.cache && rm -rf /root/.npm
COPY . /app

CMD ["npx", "ts-node", "app.ts"]