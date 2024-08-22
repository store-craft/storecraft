#!/usr/bin/env node

import { Command, program } from "commander";
import { command_create } from "../commands/create/index.js";



program
  .version("1.0.0")
  .description("My Node CLI")
  // .option("-n, --name <type>", "Add your name")
  // .action((options) => {
  //   console.log(`Hey, ${options.name}!`);
  // });
  .addCommand(
    command_create
  )

program.parse(process.argv);