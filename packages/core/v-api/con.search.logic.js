
/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.resources.search;

/**
 * 
 * @param {import("../types.public.js").App} app
 */
export const quicksearch = (app) => 
/**
 * 
 * @param {import('./types.api.query.js').ApiQuery} query
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
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    quicksearch: quicksearch(app),
  }
}
