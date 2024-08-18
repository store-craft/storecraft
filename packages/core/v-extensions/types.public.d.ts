import type { App } from "../types.public.d.ts";
import type { 
  ExtensionAction,
  ExtensionInfo 
} from "../v-api/types.api.d.ts";
  
  
/**
 * @description A backend `action` is a `function` recieving the 
 * **payload** 
 * 
 * 
 * @template PayloadType The type of the input payload
 * 
 */
export type ExtensionActionHandler<PayloadType> = 
  /**
   * @param input The payload
   */
  (input: PayloadType) => Promise<any>;
  
  
/**
 * @description Payment Gateway interface. pay attention to:
 * 1. `actions`, which specifies a list eligible `rpc` methods for 
 * invocation on this backend (through `rest-api`)
 * 
 * 
 * @template {any} Config The config type
 * 
 */
export declare interface extension<Config extends any=any> {

  /** 
   * 
   * @description info of the extension
   */
  info: ExtensionInfo;

  /** 
   * 
   * @description config of the extension 
   */
  config?: Config;

  /** 
   * 
   * @description `oninit` life cycle of the extension, you get things
   * like the `app` instance, where you can attach event handlers inside
   * the `pubsub` module, or use the `api` module to manipulate resources.
   */
  onInit: (app: App) => void;

  /**
   * 
   * @description the eligible actions in this interface for remote invocation like http
   */
  actions?: ExtensionAction[];

  /**
   * @description Invoke a public action 
   * @param action_handle the identifier of the `action`
   */
  invokeAction?<P extends any=any>(action_handle: string): ExtensionActionHandler<P>;

}