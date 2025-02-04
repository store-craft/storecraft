import { input } from "@inquirer/prompts";
import { tokens, validateEmail } from "../../utils.js";
import crypto from 'node:crypto';

export const collect_config = async () => {

  /** @type {import("@storecraft/core").StorecraftConfig} */
  const config = {
    auth_secret_access_token: crypto.randomBytes(64).toString('base64'),
    auth_secret_refresh_token: crypto.randomBytes(64).toString('base64'),
    general_store_name: await input(
      { 
        message: 'What is your store name',
        default: 'my-storecraft-app',
      },
    ),
    auth_admins_emails: tokens(
      await input(
        { 
          message: 'Enter the emails of the admins',
          required: true,
          validate: v => Boolean(tokens(v).every(validateEmail))
        }
      )
    ),
    general_store_support_email: await input(
      { 
        message: 'What is your support email (important for email sending)',
        default: 'support@storecraft.app',
      },
    ),
  }

  return {
    type: 'config',
    config
  }
}