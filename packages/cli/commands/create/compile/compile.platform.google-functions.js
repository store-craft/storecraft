import { compile_app } from './compile.app.js'
import { compile_migrate } from './compile.migrate.js';
import { 
  combine_and_pretty, Packager 
} from './compile.platform.utils.js';


/**
 * 
 * @param {import("./compile.app.js").Meta} meta 
 */
export const compile_google_functions = async (meta) => {
  const compiled_app = compile_app(meta);
  const pkgr = new Packager(meta.config.config.general_store_name);

  await pkgr.init();
  await pkgr.installDeps([...compiled_app.deps, "@google-cloud/functions-framework"]);
  await pkgr.installDevDeps([ "dotenv", "@types/node"]);
  await pkgr.write_env_file(compiled_app.env);
  const package_json = await pkgr.package_json();
  await pkgr.write_package_json(
    { 
      ...package_json, 
      "type": "module",
      "scripts": {
        "start": "npx functions-framework --target=storecraft",
        "migrate": `node ./migrate.js`
      }
    }
  );
  await pkgr.write_tsconfig_json();
  await pkgr.write_file(
    `app.js`,
    await combine_and_pretty(
      ...compiled_app.imports, '\r\n',
      'export const app = ' + compiled_app.code
    )
  );
  await pkgr.write_file(
    `index.js`, index_js()
  );
  await pkgr.write_file(
    `migrate.js`, compile_migrate(meta)
  );
  await pkgr.write_file(
    'README.md', readme_md()
  );

}

/**
 * 
 */
const index_js = () => `
import 'dotenv/config';
import * as functions from '@google-cloud/functions-framework';
import { app } from './app.js';

// console.log('env ', process.env)

functions.http(
  'storecraft',
  async (req, res) => {
    // runs once
    await app.init();

    // handler
    return app.handler(req, res);
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
# or
npx functions-framework --target=storecraft
\`\`\`

Now, open 
- \`http://localhost:8080/api/dashboard\`
- \`http://localhost:8080/api/reference\`


\`\`\`text
Author: Tomer Shalev (tomer.shalev@gmail.com)
\`\`\`
`
}