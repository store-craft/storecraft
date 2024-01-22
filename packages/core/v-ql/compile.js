import peggy from "peggy";
import * as fs from 'node:fs';
import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const mapDir = inline
//         ? path.dirname(this.outputJS)
//         : path.dirname(this.progOptions.sourceMap);

//       const file = path.relative(mapDir, this.outputJS);
//       const sourceMap = source.toStringWithSourceMap({ file });

const generate = async () => {
  const grammer = await readFile(path.resolve(__dirname, 'vql.pegjs'), { encoding: 'utf-8' });
  const source = peggy.generate(
    grammer, 
    {
      format: "es",
      output: 'source',
    }
  );

  const file = path.resolve(__dirname, 'index.js');

  await writeFile(file, source);

  console.log(source)
}

generate()