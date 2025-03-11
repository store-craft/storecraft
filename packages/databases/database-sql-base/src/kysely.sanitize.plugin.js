/**
 * @import { 
 *  KyselyPlugin, PluginTransformQueryArgs, RootOperationNode, 
 *  PluginTransformResultArgs, QueryResult, UnknownRow 
 * } from 'kysely'
 */
import { sanitize } from './utils.funcs.js';

/**
 * @description This `kysely` plugin will process query
 * results and will do the following:
 * - sanitize `undefined` and `null` values
 * - `active` keys will be transformed to `boolean`
 * 
 * @implements {KyselyPlugin}
 */
export class SanitizePlugin {

  /**
   * 
   * @param {PluginTransformQueryArgs} args 
   * 
   * 
   * @returns {RootOperationNode}
   */
  transformQuery(args) {
    return args.node;
  }

  /**
   * 
   * @param {PluginTransformResultArgs} args 
   * 
   * 
   * @returns {Promise<QueryResult<UnknownRow>>}
   */
  transformResult(args){
    sanitize(args.result.rows);

    return Promise.resolve(args.result);
  }
}
