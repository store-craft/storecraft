
import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __db_path = path.resolve(__dirname, 'dummy.json');

/**
 * A simple `key-value` database, requires `node.js`
 * 
 * @template T
 */
export class DummyDatabase {


  /**
   * @type {Record<string, T>}
   */
  #db={};
  #has_loaded=false;

  constructor() {

  }

  async #lazy_load() {
    if(this.hasLoaded)
      return;

    try {
      const db = await readFile(
        __db_path, 
        { encoding: 'utf-8' }
      );
      this.#db = JSON.parse(db);
    } catch (e) {
      console.log(e);
    }
  }

  async #save() {
    await writeFile(
      __db_path, 
      JSON.stringify(this.#db)
    );
  }

  get hasLoaded() {
    return this.#has_loaded;
  }

  /**
   * 
   * @param {string} key 
   * 
   * @returns {Promise<T>}
   */
  async get(key) {
    await this.#lazy_load();

    return this.#db[key];
  }

  /**
   * 
   * @param {string} key 
   * @param {T} value 
   * 
   * @returns {Promise<boolean>}
   */
  async set(key, value) {
    this.#db[key] = value;

    try {
      await this.#save();
    } catch(e) {
      return false;
    } 

    return true;
  }
  
}