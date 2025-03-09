import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile_deno = async (meta) => {
  const compiled_app = compile_app(meta);

  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDeps(compiled_app.deps);
  await pkgr.installDevDeps([ "dotenv", "@types/node"]);
  const package_json = await pkgr.package_json();
  await pkgr.write_env_file(compiled_app.env);
  await pkgr.write_package_json(
    { 
      ...package_json, 
      "type": "module",
      "scripts": {
        "start": "deno run --env-file --allow-env --watch -A ./index.ts",
        "migrate": "deno run --env-file --allow-env -A ./migrate.ts"
      }
    }
  );
  await pkgr.write_tsconfig_json();
  await pkgr.write_file(
    'app.ts',
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      'export const app = ' + compiled_app.code
    )
  );
  await pkgr.write_file(
    'index.ts', index_js
  );
  await pkgr.write_file(
    'migrate.ts', compile_migrate(meta)
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );

}


const index_js = `
import { app } from './app.ts';

await app.init(false);

Deno.serve(
  {
    onListen(d) {
      app.print_banner(\`http://\${d.hostname}:\${d.port}\`);
    }
  },
  app.handler
);
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
deno run --env -A ./migrate.ts
\`\`\`

Now, run the app
\`\`\`zsh
deno run --env --watch -A ./index.ts
\`\`\`

Now, open 
- \`http://localhost:8080/api/dashboard\`
- \`http://localhost:8080/api/reference\`


\`\`\`text
Author: Tomer Shalev (tomer.shalev@gmail.com)
\`\`\`
`
}