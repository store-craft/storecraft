import { input } from "@inquirer/prompts";
import { tokens, validateEmail } from "../utils.js";

export const collect_config = async () => {
  /** @type {import("@storecraft/core").StorecraftConfig} */
  const config = {
          
  }
  config.general_store_name = await input(
    { 
      message: 'What is your store name',
    }
  );

  config.auth_admins_emails = tokens(
    await input(
      { 
        message: 'Enter the emails of the admins',
        required: true,
        validate: v => Boolean(tokens(v).every(validateEmail))
      }
    )
  );

  return config;
}