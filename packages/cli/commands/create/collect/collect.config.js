/**
 * @import { StorecraftConfig } from '@storecraft/core';
 */
import { parse_csv, validateEmail } from "../../utils.js";
import crypto from 'node:crypto';
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from '@clack/prompts';
import { withCancel } from "./collect.utils.js";

export const collect_config = async () => {

  /** @type {StorecraftConfig} */
  const config = {
    auth_secret_access_token: crypto.randomBytes(64).toString('base64'),
    auth_secret_refresh_token: crypto.randomBytes(64).toString('base64'),
    general_store_name: await withCancel(
      text(
        { 
          message: 'What is your store name',
          placeholder: 'my-storecraft-app',
          defaultValue: 'my-storecraft-app',
        },
      )
    ),
    auth_admins_emails: parse_csv(
      await withCancel(
        text(
          { 
            message: 'Enter the emails of the admins',
            validate: v => !Boolean(v) || !Boolean(parse_csv(v).every(validateEmail)) ? 
                'Email format is incorrect' : undefined,
          }
        )
      )
    ),
    general_store_support_email: await withCancel(
      text(
        { 
          message: 'What is your support email (important for email sending)',
          defaultValue: 'support@storecraft.app',
          placeholder: 'support@storecraft.app',
        },
      )
    )
  }

  return {
    type: 'config',
    config
  }
}