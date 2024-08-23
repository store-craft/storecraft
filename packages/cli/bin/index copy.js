#!/usr/bin/env node

import { Command, program } from "commander";
import { command_create } from "../commands/create/index.js";
import gradient from 'gradient-string'
import chalk from 'chalk'

const logo = "\r\n   _______________  ____  ______   __________  ___    ____________\r\n  \/ ___\/_  __\/ __ \\\/ __ \\\/ ____\/  \/ ____\/ __ \\\/   |  \/ ____\/_  __\/\r\n  \\__ \\ \/ \/ \/ \/ \/ \/ \/_\/ \/ __\/    \/ \/   \/ \/_\/ \/ \/| | \/ \/_    \/ \/   \r\n ___\/ \/\/ \/ \/ \/_\/ \/ _, _\/ \/___   \/ \/___\/ _, _\/ ___ |\/ __\/   \/ \/    \r\n\/____\/\/_\/  \\____\/_\/ |_\/_____\/   \\____\/_\/ |_\/_\/  |_\/_\/     \/_\/     \r\n                                                                  \r\n"

/**
 * 
 * @param {ReadonlyArray<Command>} cmds
 */
export const util_format_help_commands = cmds => {
  const cmds_fmt = cmds.map(
    (cmd) => (
      {
        cmd: `storecraft ${cmd.name()} ${(cmd.options.length==1) ? `[${cmd.options[0].name()}]` : ''} `,
        description: cmd.description()
      }
    )
  );

  const max_length = Math.max(
    cmds_fmt.reduce(
      (a, c) => Math.max(c.cmd.length, a), 0
    ), 20
  );

  const cmds_final = cmds_fmt.map(
    (cmd) => cmd.cmd.padEnd(max_length + 2) + cmd.description
  );

  const help = cmds_final.reduce(
    (p, c) => {
      return p + `  ${c}\n`
    }, chalk.bold('COMMANDS\n')
  )

  return help;
}

program
  .version("1.0.0")
  .description("Storecraft")
  // .option("-n, --name <type>", "Add your name")
  // .action((options) => {
  //   console.log(`Hey, ${options.name}!`);
  // });
  .addCommand(command_create, { hidden: false })
  .option('-V2', 'blah')
  // .option('-V', 'version')
  .addHelpText("beforeAll", gradient('purple', 'red')(logo))
  .helpOption(false)
  .helpCommand(false)

  
program.addHelpText('afterAll', util_format_help_commands(program.commands))
  // console.log(program)
program.parse(process.argv);