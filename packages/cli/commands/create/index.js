/**
 * @import { CommandModule } from 'yargs';
 */
import { collect_config } from "./collect/collect.config.js";
import { collect_platform } from "./collect/collect.platform.js";
import { collect_database } from "./collect/collect.database.js";
import { collect_storage } from "./collect/collect.storage.js";
import { collect_mailer } from "./collect/collect.mailer.js";
import { collect_payments } from "./collect/collect.payments.js";
import { logo_gradient } from '../logo.js';
import { compile_all } from "./compile/index.js";
// import { spinner } from "./spinner.js";
import chalk from 'chalk';
import { error, good } from "./label.js";
import { intro, outro, spinner } from '@clack/prompts';
import { setTimeout as sleep } from 'node:timers/promises';
import { exit } from "node:process";
import { collect_ai_chat } from "./collect/collect.ai.chat.js";
import { collect_ai_vector_store } from "./collect/collect.ai.vector-store.js";
import { collect_ai_embedder } from "./collect/collect.ai.embedder.js";

/**
 * @type {CommandModule}
 */
export const command_create = {
  command: 'create',
  describe: '           🛍️  Create A Store',
  handler: async (args) => {
    try {
      console.log(logo_gradient);

      intro("Let's go");
  
      const meta = {
        config: await collect_config(), 
        platform: await collect_platform(),
        database: await collect_database(), 
        storage: await collect_storage(),
        ai_chat: await collect_ai_chat(), 
        ai_vector_store: await collect_ai_vector_store(),
        ai_embedder: await collect_ai_embedder(),
        mailer: await collect_mailer(),
        payments: await collect_payments()    
      }
  
      // await spinner(compile_all(meta), 'Setting Up, hold on')();
      const s = spinner({indicator: 'dots'});

      s.start('Installing')

      await compile_all(meta);
      // await sleep(3000);

      s.stop();

      outro('Done')

      console.log(
        '\n'+good(
          meta.config.config.general_store_name,
          [
            `▸ Don't forget to migrate the database with ${chalk.magentaBright('npm run migrate')}`,
            `▸ Then run ${chalk.magentaBright('npm start')}`,
          ].join('\n'),
        )
      );

    } catch (e) {
      throw e;
      console.log(error(String(e)));
    }
  },
}

  