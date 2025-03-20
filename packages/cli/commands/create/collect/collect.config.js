/**
 * @import { App, StorecraftConfig } from '@storecraft/core';
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
import { extract_env_variables } from "../compile/compile.utils.js";

export const collect_config = async () => {

  /** @type {StorecraftConfig} */
  const config = {
    auth_secret_access_token: crypto.randomBytes(64).toString('base64'),
    auth_secret_refresh_token: crypto.randomBytes(64).toString('base64'),
    auth_secret_forgot_password_token: crypto.randomBytes(64).toString('base64'),
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
            placeholder: 'john@storecraft.app',
            defaultValue: 'john@storecraft.app',
            // validate: v => !Boolean(v) || !Boolean(parse_csv(v).every(validateEmail)) ? 
            //     'Email format is incorrect' : undefined,
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
    config,
    env: extract_env_variables(
      config, 
      /** @satisfies {Partial<typeof App.EnvConfig>} */ (
        {
          // auth_admins_emails: 'SC_AUTH_ADMIN_EMAILS',
          auth_secret_access_token: 'SC_AUTH_SECRET_ACCESS_TOKEN',
          auth_secret_refresh_token: 'SC_AUTH_SECRET_REFRESH_TOKEN',
          auth_secret_forgot_password_token: 'SC_AUTH_SECRET_FORGOT_PASSWORD_TOKEN',
          checkout_reserve_stock_on: 'SC_CHECKOUT_RESERVE_STOCK_ON',
          general_confirm_email_base_url: 'SC_GENERAL_STORE_CONFIRM_EMAIL_BASE_URL',
          general_forgot_password_confirm_base_url: 'SC_GENERAL_STORE_FORGOT_PASSWORD_CONFIRM_BASE_URL',
          general_store_description: 'SC_GENERAL_STORE_DESCRIPTION',
          general_store_logo_url: 'SC_GENERAL_STORE_LOGO_URL',
          // general_store_name: 'SC_GENERAL_STORE_NAME',
          // general_store_support_email: 'SC_GENERAL_STORE_SUPPORT_EMAIL',
          general_store_website: 'SC_GENERAL_STORE_WEBSITE',
          storage_rewrite_urls: 'SC_STORAGE_REWRITE_URLS'
        }
      )
    )
  }
}