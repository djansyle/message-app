FROM docker.io/node:18.16-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system message && \
          adduser --system -G message message

COPY package.json /app/message/package.json
COPY package-lock.json /app/message/package-lock.json

RUN chown -R message:message .

RUN npm --prefix message --omit=dev -f install

COPY dist message
COPY src/types message/types

CMD ["npm", "start"]
