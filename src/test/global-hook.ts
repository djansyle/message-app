import mongoose from 'mongoose';
import getPort from 'get-port';

import { build } from '../app';

export const app = build();

beforeAll(async () => {
  const port = await getPort();
  await app.then((server) => server.start(port));
});

afterAll(async () => {
  await app.then((server) => server.stop());
  await mongoose.disconnect();
});
