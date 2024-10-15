import { app } from './app.js';

await app.init(false);

// @ts-ignore
Deno.serve(
  {
    onListen(d) {
      app.print_banner(`http://${d.hostname}:${d.port}`);
    }
  },
  app.handler
);


