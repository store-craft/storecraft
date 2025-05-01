
# Storecraft Example
<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

First, setup environment variables

fill in `.env` file
```env
OPENAI_API_KEY="*****"
CF_AI_API_KEY="*****"
CF_ACCOUNT_ID="*****"
CF_VECTORIZE_API_KEY="*****"
S3_BUCKET="bucket"
S3_ACCESS_KEY_ID="*****"
S3_SECRET_ACCESS_KEY="*****"
RESEND_API_KEY="*****"
STRIPE_PUBLISHABLE_KEY="*****"
STRIPE_SECRET_KEY="*****"
SC_AUTH_SECRET_ACCESS_TOKEN="V+1UNzPtaLjMrXVfc3epMhUuzZm7sB8drj8P99GDPV9HgCNUTgnuVW/ZksIQiknzx8a81Cg6JfU2NTKJL/MSqA=="
SC_AUTH_SECRET_REFRESH_TOKEN="eHE8ly3SIRpgDdyQN1npyUnf1j2+N4amQx6yug8G8UWtN7WA21djR70MbJSIF+NhhRu4CwuAmcvFuniIB7v+jg=="
SC_AUTH_SECRET_FORGOT_PASSWORD_TOKEN="8JxZP+hR+mRWNcXSIU5OkXolL9RcLNjTzITiZzi4dLFwklZcmOLW9344Ca4YiFM4OKPhg93gTslAXrxnC018Fg=="
SC_AUTH_SECRET_CONFIRM_EMAIL_TOKEN="69Pyl4H13Odn7c6r9GOeaEOEhbIJHsEdmeXTyznYmEsdOhwDjiGmeF3pfLLwQ6p69B42KqIIWxD/PVuJDoZM2g=="
D1_DATABASE_ID="mydb"
D1_API_TOKEN="*****"
```

Then, 
- create a `wrangler.toml` file, you can use `npx wrangler init` to create a new one.
- fill `[vars]` variables in `wrangler.toml` file
- fill `[[d1_databases]]` in `wrangler.toml` file

```toml
[vars]
OPENAI_API_KEY="*****"
CF_AI_API_KEY="*****"
CF_ACCOUNT_ID="*****"
........


# Bind a D1 database. D1 is Cloudflare’s native serverless SQL database.
# Docs: https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases
[[d1_databases]]
binding = "DB"
database_name = "main"
database_id = "<YOUR D1 DATABASE ID>"

```

Now, run migration

```zsh
npm run migrate
```

Now, run the app locally

```zsh
npm start
# or
npx wrangler dev --remote
```

Now, open 
- `http://localhost:8080/api/dashboard`
- `http://localhost:8080/api/reference`


```text
Author: Tomer Shalev (tomer.shalev@gmail.com)
```
