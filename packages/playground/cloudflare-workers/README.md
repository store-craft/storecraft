# **Storecraft** Cloudflare Worker examples

<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

Cloudflare Workers are a `js` runtime.

This example demonstrates
- Cloudflare `D1` edge database
- Cloudflare Workers compute

### First, 

Use this worker in the folder or create a new one with `npx wrangler init`,

Create a database with `cloudflare wrangler` tool,

```zsh
npx wrangler d1 create my-db
```

This will produce the following text

```txt
[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "my-db"
database_id = "0e91d39d-667a-4c95-9ac7-2386fead5d4d"
```

Copy this into `wrangler.toml` file.


### Migrate the database

- Migration happens locally over the `HTTP` variant of the driver.
- consult `migrate.js`
- You will need to set environment variables for that


### Running locally with remote db

Simply run, 

```zsh
npx wrangler dev --remote
```

Now, open 
- `http://localhost:8787/api/dashboard`
- `http://localhost:8787/api/reference`