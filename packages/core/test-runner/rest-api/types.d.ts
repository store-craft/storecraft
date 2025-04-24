import { create_api } from '../../api/index.js';

type atomic_type = Function | string | number | boolean | null | undefined;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends atomic_type ? T[K] : DeepPartial<T[K]>;
}

export type TestFunction = (...args: any) => Promise<any>;

export type API = DeepPartial<ReturnType<typeof create_api>>;

type DotPath<
  KEY extends string | number, 
  BASE extends string=''
> = BASE extends '' ? KEY : `${BASE}.${KEY}`;

export type PROOF<T, NAME extends string=''> = {
  [K in keyof T]: T[K] extends Function ? 
    ((...args: any) => Promise<DotPath<Extract<K, string>, NAME>>) : 
    PROOF<T[K], DotPath<Extract<K, string>, NAME>>;
}

export type PROOF_STRINGS<T, NAME extends string=''> = {
  [K in keyof T]: T[K] extends Function ? 
    DotPath<Extract<K, string>, NAME> : 
    PROOF_STRINGS<T[K], DotPath<Extract<K, string>, NAME>>;
}

type AnyFunction = (...args: any) => any;

export type TestSpec<
  DEFAULT_PROOF extends string = string, 
  ORIGINAL_FUNCTION extends AnyFunction = AnyFunction
> = {
  /**
   * @description this is just for reference, so you can see what the
   * default proof is, and what the proof is that you are using.
   */
  proof_type?: DEFAULT_PROOF,
  /**
   * @description this is the `sdk` function that will be called to test 
   * that `sdk->rest-api->api` was invoked.
   */
  test: TestFunction,
  /**
   * Intercept the backend API call and validate params and send a proof response.
   * @throws {Error} if the parameters are not valid
   */
  intercept_backend_api?: (
    ...args: Parameters<ORIGINAL_FUNCTION>
  ) => ReturnType<ORIGINAL_FUNCTION> | Promise<string | void>,

  [x: string]: any,
}

type TypeOrFunction<T> = T | (() => T);

export type PROOF_STRINGS_SETUP<T, NAME extends string=''> = {
  [K in keyof T]: T[K] extends AnyFunction ? 
    { 
      /**
       * @description Add multiple tests for storecraft `api`
       */
      __tests: TypeOrFunction<TestSpec<DotPath<Extract<K, string>, NAME>, T[K]>>[]
    } : 
    PROOF_STRINGS_SETUP<T[K], DotPath<Extract<K, string>, NAME>>;
}

// export type PROOF_STRINGS_SETUP<T, NAME extends string=''> = {
//   [K in keyof T]: T[K] extends Function ? 
//     {
//       proof_override?: string,
//       proof_default?: DotPath<Extract<K, string>, NAME>,
//       function_to_test: TestFunction
//     } : 
//     PROOF_STRINGS_SETUP<T[K], DotPath<Extract<K, string>, NAME>>;
// }



export type PROOF_MOCKUP_API = PROOF<API>;
export type PROOF_MOCKUP_API_SETUP = PROOF_STRINGS_SETUP<API>;

type PROOF_API = API[keyof API];
type PROOF_API1 = Awaited<ReturnType<PROOF<API>["auth"]["change_password"]>>;
type PROOF_API2 = ReturnType<API["auth"]["change_password"]>;
type PROOF_API3 = ReturnType<PROOF<API>["auth"]["change_password"]>;
type PROOF_API32 = PROOF_STRINGS<API>["auth"]["change_password"];
type PROOF_API4 = ReturnType<ReturnType<typeof create_api>["auth"]["change_password"]>;
