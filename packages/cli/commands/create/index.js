import { collect_config } from "./collect/collect.config.js";
import { collect_platform } from "./collect/collect.platform.js";
import { collect_database } from "./collect/collect.database.js";
import { collect_storage } from "./collect/collect.storage.js";
import { collect_mailer } from "./collect/collect.mailer.js";
import { collect_payments } from "./collect/collect.payments.js";
import { logo_gradient } from '../logo.js';
import { compile_all } from "./compile/index.js";
import { spinner } from "./spinner.js";
import chalk from 'chalk';


/**
 * @type {import("yargs").CommandModule}
 */
export const command_create = {
  command: 'create',
  describe: '🛍️  Create A Store',
  handler: async (args) => {
    console.log(logo_gradient);

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

    await spinner(compile_all(meta), 'Setting Up, hold on')();

    console.log(chalk.greenBright.bold('Done !'));

    // console.log('args: ', args)      
    // console.log('meta: ', meta)      
    // console.log(payments)      
  },
}

  