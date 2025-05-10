import { app } from './app.js';

// @ts-ignore
Deno.serve(
  {
    onListen(d) {
      app.print_banner(`http://${d.hostname}:${d.port}`);
    }
  },
  app.handler
);


