#!/usr/bin/env node
import { command_create } from "../commands/create/index.js";
import chalk from 'chalk'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { logo_gradient, version } from "../commands/logo.js";

const y = yargs(hideBin(process.argv));

y.command(
    command_create
  )
  .demandCommand(1)
  .updateStrings(
    {
      "Commands:": `${chalk.bold("🚦 COMMANDS")}`,
      "Options:": `${chalk.bold("🚦 OPTIONS")}`,
      "Positionals:": `${chalk.bold("🚦 POSITIONALS")}`,
      "Examples:": `${chalk.bold("🚦 EXAMPLES")}`,
    }
  )
  .group(
    ['help', 'version'],
    `${chalk.bold("🚦 GLOBAL FLAGS")}`
  )
  .help("help", "Show help")
  .alias("h", "help")
  .alias("version", "v")
  .usage(
    logo_gradient
  )
  .wrap(null)
  .parse()
 