import { compile_app } from './compile.app.js'
import { combine_and_pretty, init_npm_pkg, Packager } from './compile.platform.utils.js';



/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile = async (meta) => {
  const compiled_app = await compile_app(meta);

  const pkgr = new Packager(meta.config.config.general_store_name);
  await pkgr.init();
  await pkgr.addDeps(...compiled_app.deps).installDeps();
  const package_json = await pkgr.package_json();
  await pkgr.write_package_json({ ...package_json, "type": "module" });
  await pkgr.write_file(
    'app.js',
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      'export const app = ' + compiled_app.code
    )
  );
  await pkgr.write_file(
    'index.js', index_js
  );

}


const index_js = `
import 'dotenv/config';
import http from "node:http";
import { app } from './app.js';
 
await app.init();

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log('Storecraft is running on http://localhost:8000');
  }
); 
`;