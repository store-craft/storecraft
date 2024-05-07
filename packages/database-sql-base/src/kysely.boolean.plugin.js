import { sanitize } from './utils.funcs.js';

/**
 * @typedef {import('kysely').KyselyPlugin} KyselyPlugin
 * 
 * 
 * @implements {KyselyPlugin}
 */
export class BooleanPlugin {

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
