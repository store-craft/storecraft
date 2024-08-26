import { exec } from 'node:child_process'
import util from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { prettify } from './compile.utils.js';
const exec_promise = util.promisify(exec);

/**
 * URL friendly handle
 * @param {string} title 
 * @returns {string | undefined}
 */
export const to_handle = (title, delimiter='-') => {
  if(typeof title !== 'string')
    return undefined
  let trimmed = title.trim()
  if(trimmed === "")
    return undefined
  
  trimmed = trimmed.toLowerCase().match(/[\p{L}\d]+/gu).join(delimiter)
  if(trimmed.length==0)
      return undefined
  
  return trimmed
}

/**
 * 
 * @param  {...string} cmds 
 */
export const run_cmd = async (...cmds) => {
  
  const {
    stderr, stdout
  } = await exec_promise(cmds.join(' && '));

  return {
    stderr, stdout
  }
}

/**
 * 
 * @param  {...string} sources 
 */
export const combine_and_pretty = async (...sources) => {
  const all = sources.map(s => s).filter(Boolean).join('\n');

  console.log(all)

  return await prettify(all);
}


export class Packager {

  #hasInit = false;

  /**
   * 
   * @param {string} folder 
   */
  constructor(folder) {
    this.folder = to_handle(folder);
  }

  /**
   * 
   * @param {string} path 
   */
  create_folder = (path) => {
    return mkdir(path, {recursive: true});
  }

  async init() {
    const current_cwd = process.cwd();

    await this.create_folder(`${this.folder}/node_modules`);

    process.chdir(this.folder);

    const {
      stderr, stdout
    } = await run_cmd('npm init -y');
  
    console.log(
      stderr, stdout
    )
    this.#hasInit = true;

    return {
      stderr, stdout
    }
  }

  /**
   * 
   * @param  {string[]} deps 
   * @param  {Record<string, string>} [options] 
   */
  async installDeps(deps, options = {}) {
    if(!this.#hasInit)
      throw new Error('please init first !!!');

    const options_string = Object.entries(options).reduce(
      (p, c) => `${p} + ${c[0] ?? ''} ${c[1] ?? ''}` , ''
    );

    const {
      stderr, stdout
    } = await run_cmd(`npm i ${options_string} ${deps.join(' ')}`);
  
    return {
      stderr, stdout
    }
  }

  /**
   * 
   * @param  {string[]} deps 
   */
  installDevDeps(deps) {
    return this.installDeps(deps, { '-D': '' });
  }


  async package_json() {
    const file = await readFile('package.json', {
      encoding: 'utf-8'
    });
    
    return JSON.parse(file);
  }

  /**
   * @param {any} obj 
   */
  write_package_json(obj) {
    return writeFile('package.json', JSON.stringify(obj, null, 2));
  }

  /**
   * @param {string} path 
   * @param {any} obj 
   */
  async write_file(path, obj) {
    await this.create_folder(dirname(path));
    await writeFile(path, obj);
  }

  write_tsconfig_json() {
    const content = `
{
  "compilerOptions": {
    "checkJs": true,
    "allowJs": true,
    "maxNodeModuleJsDepth": 10,
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true
  },
  "include": ["*", "**/*"],
  "exclude": ["*.json"]
}
`
    return this.write_file('tsconfig.json', content);
  }

}

/**
 * 
 * @param {string} folder 
 * @param {string[]} deps 
 */
export const init_npm_pkg = async (folder, deps) => {
  const cmds = [
    'npm init -y',
    `npm i ${deps.join(' ')}`
  ].join(' && ')
  const current_cwd = process.cwd();
  const folder_handle = to_handle(folder);
  await mkdir(`${folder_handle}/node_modules`, {recursive: true});
  process.chdir(folder_handle);
  const {
    stderr, stdout
  } = await exec_promise(cmds);

  return {
    stderr, stdout
  }
}


