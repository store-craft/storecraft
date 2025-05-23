# Storecraft Cloudflare D1 Database support

One issues awaiting:
2. On CF side, they relaxed the FUNC_ARGS_LENGTH, so now json sql should work for me.

Two variants,
1. D1 over http (used for migrations)
2. D1 over cloudflare-worker runtime (used for backend)

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Official `Cloudflare D1` driver for `StoreCraft` on any platforms.

```bash
npm i @storecraft/database-cloudflare-d1
```

## Setup

- First, login to your cloudflare account.
- Create a `D1` database:
  - Through the dashboard, or
  - Through the command line, using `wrangler`:
    ```bash
    npx wrangler d1 create <YOUR-DATABASE-NAME>
    ```
  - Record the `database_id` and `account_id` for later use.
- Create an API Key at [here](https://dash.cloudflare.com/profile/api-tokens)


## Apply migrations with local driver

Migrations use a different `D1_HTTP` driver,

create a `migrate.js` file with

```ts
import 'dotenv/config';
import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
import { migrateToLatest } from '@storecraft/database-cloudflare-d1/migrate.js';
 
const migrate = async () => {
  const d1_over_http = new D1_HTTP(
    {
      account_id: process.env.CF_ACCOUNT_ID,
      api_token: process.env.D1_API_KEY,
      database_id: process.env.D1_DATABASE_ID
    }
  )
  
  await migrateToLatest(d1_over_http, true);
}

migrate();
```

create a `.env` file with (find the values from cloudflare dashboard)
```zsh
CF_ACCOUNT_ID=".."
D1_API_TOKEN=".."
D1_DATABASE_ID=".."
```

simply run it,

```zsh
node run migrate.js
```

NOTE: 
- seeding of templates migration might fail because http driver does not allow for sql parameters
- we are working on a solution for that
- no big deal, you can still use it


## D1 over Cloudflare Workers

To use the driver in cloudflare workers environment, we use the native driver
of cloudflare, which allows for parameterized sql statements (the http driver does not for some
reason, which we hope they will solve and then we can run d1 with parameterized statements
at any cloud environment safely without fearing SQL Injection)

So, Create a `worker` with `npx wrangler init`

Populate `wrangler.toml` with 

```txt
[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "<YOUR-DATABASE-NAME>"
database_id = "<YOUR-DATABASE-ID>"
```

Create a `src/index.ts` file with

```ts
import { App } from "@storecraft/core"
import { D1_WORKER } from "@storecraft/database-cloudflare-d1"
import { CloudflareWorkersPlatform } from "@storecraft/core/platform/cloudflare-workers"


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
      {
        storage_rewrite_urls: undefined,
        general_store_name: 'Wush Wush Games',
        general_store_description: 'We sell cool retro video games',
        general_store_website: 'https://wush.games',
        auth_admins_emails: ['tomer.shalev@gmail.com']
      }
    )
    .withPlatform(new CloudflareWorkersPlatform())
    .withDatabase(
      new D1_WORKER(
        {
          db: env.D1
        } 
      )
    ).init();

    const response = await app.handler(request);

    return response;

	},
} satisfies ExportedHandler<Env>;

```

run locally with remote database

```zsh
npx wrangler dev --remote
```

Now, you are good to go, visit
- `http://localhost:8787/api/dashboard`
- `http://localhost:8787/api/reference`

```text
Author: Tomer Shalev <tomer.shalev@gmail.com>
```