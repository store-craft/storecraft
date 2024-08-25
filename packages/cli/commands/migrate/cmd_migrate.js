import { Command } from "commander"

export const command_migrate = new Command('migrate')
  .description('migrate database')
  .action(
    (options) => {
      console.log(options)
    }
  )