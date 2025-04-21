/**
 * @import { ExtensionItemGet } from '../api/types.api.js';
 */
import { assert } from '../api/utils.func.js'
import { App } from '../index.js';


/**
 * @template {App} T
 * @param {T} app
 */
export const get_extension = (app) => 
  /**
   * @description `Get` Extension info
   * @param {keyof T["extensions"]} extension_handle `handle` of `extension` 
   * @returns {Promise<ExtensionItemGet>}
   */
  async (extension_handle) => {
    const handle = /** @type {string} */(extension_handle);
    const ext = app.extensions?.[handle];

    assert(
      ext,
      `Extension with handle=${handle} was not found !`
    );

    return {
      config: ext.config,
      info: ext.info,
      handle: handle, 
      actions: ext.actions,
    }
  }

/**
 * @param {App} app 
*/
export const list_extensions = (app) => 
  /**
   * @description `List` extensions info
   * @returns {Promise<ExtensionItemGet[]>}
   */
  async () => {
    return Object.entries(app.extensions ?? {}).map(
      ([handle, ext]) => (
        {
          config: ext.config,
          info: ext.info,
          handle: handle,
          actions: ext.actions ?? []
        }
      )
    )
  }


/**
 * @template {App} T
 * @param {T} app
*/
export const invoke_extension_action = (app) => 
  /**
   * @description Invoke an `extension` **Action**.
   * @param {keyof T["extensions"]} extension_handle `extension` handle for identification
   * @param {string} action_handle `action` handle of extension
   * @param {any} [body] `action` input
   */
  async (
    extension_handle, action_handle, body
  ) => {
    const handle = /** @type {string} */(extension_handle);
    const ext = app.extensions?.[handle];

    assert(
      ext, 
      `extension with handle ${handle} was not found`, 
      400
    );

    return ext.invokeAction?.(action_handle)?.(body);
  }


/**
 * @template {App} T
 * @param {T} app
 */  
export const inter = app => {

  return {
    get: get_extension(app),
    list_all: list_extensions(app),
    invoke_action: invoke_extension_action(app),
  }
}