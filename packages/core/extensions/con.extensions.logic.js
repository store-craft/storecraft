/**
 * @import { ExtensionItemGet } from '../api/types.api.js';
 */
import { assert } from '../api/utils.func.js'
import { App } from '../index.js';


/**
 * 
 * @description `Get` Extension info
 * 
 * @param {App} app 
 * @param {string} extension_handle `handle` of `extension` 
 * 
 * @returns {ExtensionItemGet}
 */
export const get_extension = (app, extension_handle) => {
  const ext = app.extensions?.[extension_handle];

  assert(
    ext,
    `Extension with handle=${extension_handle} was not found !`
  );

  return {
    config: ext.config,
    info: ext.info,
    handle: extension_handle, 
    actions: ext.actions,
  }
}

/**
 * 
 * @description `List` extensions info
 * 
 * @param {App} app 
 * 
 * 
 * @returns {ExtensionItemGet[]}
 */
export const list_extensions = (app) => {
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
 * @description Invoke an `extension` **Action**.
 * 
 * 
 * @param {App} app `storecraft` app
 * @param {string} extension_handle `extension` handle for identification
 * @param {string} action_handle `action` handle of extension
 * @param {any} [body] `action` input
 * 
 */
export const invoke_extension_action = async (
  app, extension_handle, action_handle, body
) => {

  const ext = app.extensions?.[extension_handle];

  assert(
    ext, 
    `extension with handle ${extension_handle} was not found`, 
    400
  );

  return ext.invokeAction?.(action_handle)?.(body);
}
