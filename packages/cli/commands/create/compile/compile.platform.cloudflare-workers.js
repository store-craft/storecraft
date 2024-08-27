import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile_workers = async (meta) => {
  const compiled_app = compile_app(meta);
  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDeps([...compiled_app.deps]);
  await pkgr.installDevDeps([ "dotenv", "@types/node", "typescript", "wrangler"]);
  const package_json = await pkgr.package_json();
  await pkgr.write_package_json(
    { 
      ...package_json, 
      "type": "module",
      "scripts": {
        "deploy": "npx wrangler deploy",
        "dev": "npx wrangler dev --remote",
        "start": "npx wrangler dev --remote",
        "cf-typegen": "npx wrangler types",
        "migrate": `node ./migrate.js`
      }
    }
  );
  await pkgr.write_tsconfig_json();
  await pkgr.write_file(
    `src/index.ts`,
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      index_content(compiled_app.code)
    )
  );
  await pkgr.write_file(
    `migrate.js`, compile_migrate(meta)
  );
  await pkgr.write_file(
    'wrangler.toml', wrangler_toml(meta)
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );

}

/**
 * 
 * @param {string} app_code 
 */
const index_content = (app_code) => `

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

${app_code}    

    app = await app.init();
    
    const response = await app.handler(request);

    return response;

	},
} satisfies ExportedHandler<Env>;

`;


/**
 * 
 * @param {import('./compile.app.js').Meta} meta 
 */
const wrangler_toml = (meta) => {
  const uses_d1 = meta.database.id==='d1';

  return [
`
#:schema node_modules/wrangler/config-schema.json
name = "calm-term-c64e"
main = "src/index.ts"
compatibility_date = "2024-08-06"

[vars]
MY_VARIABLE = "production_value"

`,
  uses_d1 ? 
    wrangler_toml_with_d1(
      (/** @type {import('@storecraft/database-cloudflare-d1').D1ConfigHTTP} */ (meta.database.config)).database_id
    ) :
    undefined
].filter(Boolean).join('/n/n');

}

/**
 * 
 * @param {string} d1_id 
 */
const wrangler_toml_with_d1 = d1_id => `

# Bind a D1 database. D1 is Cloudflare’s native serverless SQL database.
# Docs: https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases
[[d1_databases]]
binding = "D1"
database_name = "main"
database_id = "${d1_id}"

`;


const readme_md = () => {
  return `
# Storecraft Example
<div style="text-align:center">
  <img src='https://storecraft.app/storecraft-color.svg' 
       width='90%' />
</div><hr/><br/>

\`\`\`zsh
npm install
\`\`\`

Now, migrate database with
\`\`\`zsh
npm run migrate
\`\`\`

Now, run the app
\`\`\`zsh
npm start
# or
npx wrangler dev --remote
\`\`\`

Now, open 
- \`http://localhost:8080/api/dashboard\`
- \`http://localhost:8080/api/reference\`


\`\`\`text
Author: Tomer Shalev (tomer.shalev@gmail.com)
\`\`\`
`
}