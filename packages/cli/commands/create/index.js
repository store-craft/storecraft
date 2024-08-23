import { input, select } from '@inquirer/prompts';
import { collect_config } from "./collect.config.js";
import { collect_platform } from "./collect.platform.js";
import { collect_database } from "./collect.database.js";
import { collect_storage } from "./collect.storage.js";
import { collect_mailer } from "./collect.mailer.js";
import { collect_payments } from "./collect.payments.js";
import { logo_gradient } from '../logo.js';


/**
 * @type {import("yargs").CommandModule}
 */
export const command_create = {
  command: 'create [name]',
  describe: '🛍️  Create A Store',
  handler: async (args) => {
    console.log(logo_gradient)
    const config = await collect_config();
    const platform = await collect_platform();
    const database = await collect_database();
    const storage = await collect_storage();
    const mailer = await collect_mailer();
    const payments = await collect_payments();

    const meta = {
      config, 
      platform,
      database, 
      storage,
      mailer,
      payments      
    }

    console.log('args: ', args)      
    // console.log(payments)      
  },
  builder: yarg => {
    return yarg.positional(
      'name', {type: 'string', default: 'my-storecraft-app'}
    ).epilog('hello')
  }
}

  