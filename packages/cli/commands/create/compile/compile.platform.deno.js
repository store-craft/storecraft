import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile = async (meta) => {
  const compiled_app = compile_app(meta);

  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDeps(compiled_app.deps);
  await pkgr.installDevDeps([ "dotenv", "@types/node"]);
  const package_json = await pkgr.package_json();
  await pkgr.write_package_json(
    { 
      ...package_json, 
      "type": "module",
      "scripts": {
        "start": "deno run --env --watch -A ./index.ts",
        "migrate": "deno run --env -A ./migrate.ts"
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

}


const index_js = `
import { app } from './app.ts';
 
await app.init();

const server = Deno.serve(
  {
    port: 8000,
    fetch: app.handler
  }
);

console.log('Listening on http://localhost:' + server.port);
`;
