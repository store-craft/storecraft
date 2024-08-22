import { Command } from "commander"
import { input, select } from '@inquirer/prompts';
import { collect_config } from "./collect_config.js";
import { collect_platform } from "./collect_platform.js";
import { collect_database } from "./collect_database.js";
import { collect_storage } from "./collect_storage.js";
import { collect_mailer } from "./collect_mailer.js";
import { collect_payments } from "./collect_payments.js";

export const command_create = new Command('create')
  .description('create a new store')
  .action(
    async (options) => {

      // const config = await collect_config();
      // const platform = await collect_platform();
      // const db = await collect_database();
      // const storage = await collect_storage();
      // const mailer = await collect_mailer();
      const payments = await collect_payments();
      // console.log(db)      
      console.log(payments)      

    }
  )

