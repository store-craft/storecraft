import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile_node = async (meta) => {
  const compiled_app = compile_app(meta);
  const post = meta.config.is_typescript ? 'ts' : 'js';
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
        "start": `node --watch ./index.${post}`,
        "migrate": `node ./migrate.${post}`
      }
    }
  );
  await pkgr.write_tsconfig_json();
  await pkgr.write_file(
    `app.${post}`,
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      'export const app = ' + compiled_app.code
    )
  );
  await pkgr.write_file(
    `index.${post}`, index_js(post)
  );
  await pkgr.write_file(
    `migrate.${post}`, compile_migrate(meta)
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );

}


const index_js = post => `
import 'dotenv/config';
import http from "node:http";
import { app } from './app.${post}';
 
await app.init();

const server = http.createServer(app.handler).listen(
  8000,
  () => {
    console.log('Storecraft is running on http://localhost:8000');
  }
); 
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
\`\`\`

Now, open 
- \`http://localhost:8080/api/dashboard\`
- \`http://localhost:8080/api/reference\`


\`\`\`text
Author: Tomer Shalev (tomer.shalev@gmail.com)
\`\`\`
`
}