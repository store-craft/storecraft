/**
 * @import { ApiQuery } from './types.api.query.js'
 */

import { App } from '../index.js';

/**
 * @param {App} app
 */
export const db = app => app.db.resources.search;

/**
 * 
 * @param {App} app
 */
export const quicksearch = (app) => 
/**
 * 
 * @param {ApiQuery} query
 */
(query) => {
  return app.db.resources.search.quicksearch(
    {
      expand: ['*'],
      ...query
    }
  );
}


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    quicksearch: quicksearch(app),
  }
}
