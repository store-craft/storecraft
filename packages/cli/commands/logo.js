import gradient from 'gradient-string';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const json = JSON.parse(
  await readFile(
    path.resolve(__dirname, '..', 'package.json'), 
    { encoding: 'utf-8' }
  )
)


export const logo = `\r\n   _______________  ____  ______   __________  ___    ____________\r\n  \/ ___\/_  __\/ __ \\\/ __ \\\/ ____\/  \/ ____\/ __ \\\/   |  \/ ____\/_  __\/\r\n  \\__ \\ \/ \/ \/ \/ \/ \/ \/_\/ \/ __\/    \/ \/   \/ \/_\/ \/ \/| | \/ \/_    \/ \/   \r\n ___\/ \/\/ \/ \/ \/_\/ \/ _, _\/ \/___   \/ \/___\/ _, _\/ ___ |\/ __\/   \/ \/    \r\n\/____\/\/_\/  \\____\/_\/ |_\/_____\/   \\____\/_\/ |_\/_\/  |_\/_\/     \/_\/     \r\n                                                            v${json.version}\r\n`;

export const logo_gradient = gradient('purple', 'red')(logo);