/**
 * @import { Meta } from './compile.app.js'
 * @import { D1_HTTP, D1ConfigHTTP } from '@storecraft/database-cloudflare-d1'
 */
import { collect_database } from '../collect/collect.database.js';
import { choices } from '../collect/collect.platform.js';
import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, object_to_env_file_string, Packager, 
  run_cmd
} from './compile.platform.utils.js';
import { assert } from './compile.utils.js';


/**
 * 
 * @param {Meta} meta 
 */
export const compile_workers = async (meta) => {
  // console.log(meta)
  // replace d1-http with d1-worker
  const compiled_app_workers = compile_app({
    ...meta,
    database: meta.database.id==='d1-http' ? {
      id: 'd1-worker',
      type: 'database',
      config: meta.database.config
    } : meta.database
  });

  // replace platform cf-workers for node, for migrate logic
  const compiled_app_node = compile_app({
    ...meta,
    platform: {
      id: 'node',
      config: {},
      type: 'platform'
    },
  });

  // console.log(meta)
  // console.log(compiled_app_workers)
  // console.log(compiled_app_node)


  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDevDeps(
    [ 
      "dotenv", "@types/node", "typescript", "wrangler", 
      '@cloudflare/workers-types', ...compiled_app_node.deps
    ]
  );
  await pkgr.installDeps([...compiled_app_workers.deps]);
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
  await pkgr.write_tsconfig_json(ts_config);
  await pkgr.write_file(
    `src/index.ts`,
    await combine_and_pretty(
      ...compiled_app_workers.imports, '\r\n',
      index_content(compiled_app_workers.code)
    )
  );
  await pkgr.write_file(
    `app.js`,
    await combine_and_pretty(
      ...compiled_app_node.imports, '\r\n',
      'export const app = ' + compiled_app_node.code
    )
  );
  await pkgr.write_file(
    `migrate.js`, compile_migrate(meta)
  );
  await pkgr.write_env_file(
    {...compiled_app_workers.env, ...compiled_app_node.env}
  );
  await pkgr.write_file(
    'wrangler.toml', 
    wrangler_toml(
      meta, 
      {...compiled_app_workers.env, ...compiled_app_node.env}
    )
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );
  // await pkgr.

  await run_cmd('npx wrangler types ./src/worker-configuration.d.ts');

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

    const app = ${app_code}    

    await app.init();
    
    const response = await app.handler(request);

    return response;
	},
} satisfies ExportedHandler<Env>;

`;


/**
 * 
 * @param {Meta} meta 
 * @param {Record<string, string>} env_vars
 */
const wrangler_toml = (meta, env_vars={}) => {
  const uses_d1 = meta.database.id==='d1-http' || meta.database.id==='d1-worker';
  let d1_id;
  if(uses_d1) {
    d1_id = (/** @type {D1ConfigHTTP} */ (meta.database.config)).database_id ?? 
      (
        env_vars[/** @satisfies {typeof D1_HTTP.EnvConfig["database_id"]} */ ('D1_DATABASE_ID')]
      );
    
    assert(
      d1_id, 
      'D1_DATABASE_ID not found in env vars or database config'
    );
  }

  return [
`
#:schema node_modules/wrangler/config-schema.json
name = "calm-term-c64e"
main = "src/index.ts"
compatibility_date = "2024-08-06"

[vars]
${object_to_env_file_string(env_vars)}

`,
  uses_d1 ? 
    wrangler_toml_with_d1(d1_id) :
    undefined
].filter(Boolean).join('\n\n');

}

/**
 * 
 * @param {string} d1_id 
 */
const wrangler_toml_with_d1 = d1_id => `

# Bind a D1 database. D1 is Cloudflare’s native serverless SQL database.
# Docs: https://developers.cloudflare.com/workers/wrangler/configuration/#d1-databases
[[d1_databases]]
binding = "DB"
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


const ts_config = `
{
	"compilerOptions": {
		/* Visit https://aka.ms/tsconfig.json to read more about this file */

		/* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
		"target": "es2021",
		/* Specify a set of bundled library declaration files that describe the target runtime environment. */
		"lib": ["es2021"],
		/* Specify what JSX code is generated. */
		"jsx": "react-jsx",

		/* Specify what module code is generated. */
		"module": "es2022",
		/* Specify how TypeScript looks up a file from a given module specifier. */
		"moduleResolution": "Bundler",
		/* Specify type package names to be included without being referenced in a source file. */
		"types": [
			"@cloudflare/workers-types/2023-07-01"
		],
		/* Enable importing .json files */
		"resolveJsonModule": true,
		"maxNodeModuleJsDepth": 100,

		/* Allow JavaScript files to be a part of your program. Use the \`checkJS\` option to get errors from these files. */
		"allowJs": true,
		/* Enable error reporting in type-checked JavaScript files. */
		"checkJs": false,

		/* Disable emitting files from a compilation. */
		"noEmit": true,

		/* Ensure that each file can be safely transpiled without relying on other imports. */
		"isolatedModules": true,
		/* Allow 'import x from y' when a module doesn't have a default export. */
		"allowSyntheticDefaultImports": true,
		/* Ensure that casing is correct in imports. */
		"forceConsistentCasingInFileNames": true,

		/* Enable all strict type-checking options. */
		"strict": true,

		/* Skip type checking all .d.ts files. */
		"skipLibCheck": true
	},
	"exclude": ["test"],
	"include": ["worker-configuration.d.ts", "src/*.ts", "src/**/*.ts"]
}
`