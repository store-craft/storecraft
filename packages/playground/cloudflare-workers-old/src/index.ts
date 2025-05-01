import { App } from "@storecraft/core"
import { D1_WORKER } from "@storecraft/database-cloudflare-d1"
import { CloudflareWorkersPlatform } from "@storecraft/core/platform/cloudflare-workers"
import {
  type ExportedHandler,
  type ExecutionContext,
  type Request,
  type Response,
} from "@cloudflare/workers-types"


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
    
    const app = new App(
      {
        auth_secret_access_token: 'auth_secret_access_token',
        auth_secret_refresh_token: 'auth_secret_refresh_token',
        auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
        auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
        storage_rewrite_urls: undefined,
        general_store_name: 'Wush Wush Games',
        general_store_description: 'We sell cool retro video games',
        general_store_website: 'https://wush.games',
        auth_admins_emails: ['tomer.shalev@gmail.com']
      }
    )
    .withPlatform(new CloudflareWorkersPlatform({ env }))
    .withDatabase(
      new D1_WORKER(
        {
          db: env.D1
        } 
      )
    );

    await app.init();
    
    const response = await app.handler(request);

    return response;

	},
} satisfies ExportedHandler<Env>;
