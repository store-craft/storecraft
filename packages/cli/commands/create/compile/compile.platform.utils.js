import { exec } from 'node:child_process'
import util from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
  /** @type {string[]} */
  #deps;

  #hasInit = false;

  /**
   * 
   * @param {string} folder 
   */
  constructor(folder) {
    this.folder = to_handle(folder);
    this.#deps = [];
  }

  async init() {
    const current_cwd = process.cwd();

    await mkdir(`${this.folder}/node_modules`, {recursive: true});

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

  async installDeps() {
    if(!this.#hasInit)
      throw new Error('please init first !!!');

    const {
      stderr, stdout
    } = await run_cmd(`npm i ${this.#deps.join(' ')}`);
  
    return {
      stderr, stdout
    }
  }

  /**
   * 
   * @param  {...string} deps 
   */
  addDeps(...deps) {
    this.#deps.push(...deps);

    return this;
  }

  get deps() {
    return this.#deps;
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
   * @param {import('node:fs').PathLike} path 
   * @param {any} obj 
   */
  write_file(path, obj) {
    return writeFile(path, obj);
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


