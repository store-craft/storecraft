import { App } from "@storecraft/core"
import { D1_WORKER } from "@storecraft/database-cloudflare-d1"
import { CloudflareWorkersPlatform } from "@storecraft/platform-cloudflare-workers"


export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
    let app = new App(
      new CloudflareWorkersPlatform(), 
      new D1_WORKER(
        {
          db: env.D1
        } 
      ),
      undefined,
      undefined,
      {
        auth_admins_emails: ['tomer.shalev@gmail.com']
      }
    );

    app = await app.init();
    
    const response = await app.handler(request);

    return response;

    return new Response('hi');

    

    // app = await app.init();
    
    // const response = await app.handler(request);

    // return response;

    // const r = await env.D1.batch(
    //   [ 
    //     env.D1.prepare('select * from test_1') 
    //   ]
    // );

    // console.log('r', JSON.stringify(r))

    
		// return new Response(JSON.stringify(r), {headers: {"Content-Type": 'application/json'}});
	},
} satisfies ExportedHandler<Env>;
