/**
 * @import { Meta } from './compile.app.js';
 */
import { compile_aws } from "./compile.platform.aws-lambda.js";
import { compile_bun } from "./compile.platform.bun.js";
import { compile_workers } from "./compile.platform.cloudflare-workers.js";
import { compile_deno } from "./compile.platform.deno.js";
import { compile_google_functions } from "./compile.platform.google-functions.js";
import { compile_node } from "./compile.platform.node.js";
import { assert } from "./compile.utils.js";



/**
 * 
 * @param {Meta} meta 
 */
export const compile_all = async (meta) => {
  assert(
    meta?.platform?.id
  );
  
  switch(meta.platform.id) {
    case "node":
      await compile_node(meta);
      break;
    case "bun":
      await compile_bun(meta);
      break;
    case "deno":
      await compile_deno(meta);
      break;
    case "cloudflare-workers":
      await compile_workers(meta);
      break;
    case "aws-lambda":
      await compile_aws(meta);
      break;
    case "google-functions":
      await compile_google_functions(meta);
      break;
    default:
      throw new Error(`platform ${meta.platform.id} unknown :(`);
  }

  
}