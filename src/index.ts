import { build } from './app.js';

async function main() {
  const app = await build();
  await app.start(parseInt(process.env.PORT || '8080'));
}

main();
