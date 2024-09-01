import { app } from './app.ts';

await app.init(false);

Deno.serve(
  {
    onListen(d) {
      app.print_banner(`http://${d.hostname}:${d.port}`);
    }
  },
  app.handler
);


