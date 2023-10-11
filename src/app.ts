import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import mongoose from 'mongoose';

import createSchema from './library/build-schema.js';
import authorizationPlugin from './library/authorization-plugin.js';

export async function build() {
  const app = express();
  const httpServer = createServer(app);

  const schema = createSchema();

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  });

  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer({
    schema,
    formatError: (formattedError) => {
      return {
        message: formattedError.message,
        code: (formattedError.extensions as any)?.code,
      };
    },
    plugins: [
      authorizationPlugin(),
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await mongoose.connect(
    process.env.MONGO_URL || 'mongodb://localhost:27017/message',
  );

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server),
  );

  return {
    httpServer,
    start: async (port: number) => {
      await new Promise<void>((resolve) =>
        httpServer.listen({ port }, () => {
          console.log(`Apollo Server on http://localhost:${port}/graphql`);
          resolve();
        }),
      );
    },
    stop: async () => {
      await server.stop();
      httpServer.close();
    },
  };
}
