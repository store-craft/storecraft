import type { 
    ExtensionAction,
    ExtensionInfo 
} from "../v-api/types.api.js";
  
  
/**
 * @template PayloadType The type of the input payload
 * @description A backend `action` is a `function` recieving the 
 * **payload** 
 */
export type ExtensionActionHandler<PayloadType> = 
  /**
   * @param input The payload
   */
  (input: PayloadType) => Promise<any>;
  
  
  /**
   * Payment Gateway interface.
   * pay attention to:
   * 1. `actions()` getter, which specifies a list eligible 
   * rpc methods for invocation on this backend (for example 
   * `void`, `capture`, `refund` or whatever)
   * 
   * 
   * @template {any} Config The config type
   * 
   */
  export declare interface extension<Config extends any=any> {
  
    /** 
     * 
     * @description info of the payment gateway 
     */
    get info(): ExtensionInfo;
  
    /** 
     * 
     * @description config of the gateway 
     */
    get config(): Config;
  
    /**
     * 
     * @description the eligible actions in this interface for remote invocation
     */
    get actions(): ExtensionAction[];
  
    /**
     * 
     * @param action_handle the identifier of the `action`
     */
    invokeAction<P extends any=any>(action_handle: string): 
        ExtensionActionHandler<P>;
  
  }