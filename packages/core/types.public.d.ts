// import type { StorecraftConfig as StorecraftConfig_ } from './api/types.api.d.ts';
// import { App as App_ } from './index.js';


// export declare namespace Storecraft {
//   type StorecraftConfig = StorecraftConfig_;
//   type App = App_;
// }

export { type StorecraftConfig } from './api/types.api.js';
import { App } from './index.js';
export { App } from './index.js';

type storecraft_properties_after_build = '__show_me_everything' | 
  'info' | 'print_banner' | 'pubsub' | 'config' | 
  'isready' | 'handler' | 'api' | 'env' | '_';

export type OmitAppBuild<APP extends App = App> = Omit<
  APP, 
  storecraft_properties_after_build
>;

export type InitializedStorecraftApp<APP extends App = App> = Pick<
  APP, 
  storecraft_properties_after_build
>;

/**
 * @description A small utility type to rewrite any record type
 * recursively with string values. Will be used to map env variables
 * names
 */
export type ENV<T> = Partial<
  {
    readonly [K in keyof T]: T[K] extends (number | string | boolean | Function | any[]) ? string : ENV<T[K]>
    // readonly [K in keyof T]: T[K] extends (any[] | Function) ? string : T[K] extends Record<string, any> ? ENV<T[K]> : (string)
  }
>;

  