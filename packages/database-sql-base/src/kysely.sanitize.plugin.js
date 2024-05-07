import { sanitize } from './utils.funcs.js';

/**
 * @description This `kysely` plugin will process query
 * results and will do the following:
 * - sanitize `undefined` and `null` values
 * - `active` keys will be transformed to `boolean`
 * 
 * 
 * @typedef {import('kysely').KyselyPlugin} KyselyPlugin
 * 
 * 
 * @implements {KyselyPlugin}
 */
export class SanitizePlugin {

  /**
   * 
   * @param {import('kysely').PluginTransformQueryArgs} args 
   * 
   * 
   * @returns {import('kysely').RootOperationNode}
   */
  transformQuery(args) {
    return args.node;
  }

  /**
   * 
   * @param {import('kysely').PluginTransformResultArgs} args 
   * 
   * 
   * @returns {Promise<import('kysely').QueryResult<import('kysely').UnknownRow>>}
   */
  transformResult(args){
    sanitize(args.result.rows);

    return Promise.resolve(args.result);
  }
}
