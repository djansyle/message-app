FROM docker.io/node:18.16-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system message && \
          adduser --system -G message message

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN chown -R message:message .

COPY . /app
RUN npm install && \
    npm run build && \
    npm prune --production

CMD ["node", "dist"]
