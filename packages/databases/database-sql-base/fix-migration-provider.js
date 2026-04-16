import { promises as fs } from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

export class FixedFileMigrationProvider {
  /**
   * @param {{fs: typeof import("fs").promises, path: typeof import("path"), migrationFolder: string}} config
   */
  constructor(config) {
    this.fs = config.fs;
    this.path = config.path;
    this.migrationFolder = config.migrationFolder;
  }

  async getMigrations() {
    const files = await this.fs.readdir(this.migrationFolder);
    // we will have to import these dynamically, so we build a map of name to module exports
    // the type any is because we don't know the shape of the exports, and it can vary between migrations
    const migrations = /** @type {Record<string, any>} */ ({});

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const full = this.path.join(this.migrationFolder, file);
      let url = pathToFileURL(full).href;

      // windows triple-slash issue
      url = url.replace(/^file:\/\/\//, "file:///");

      const name = file.replace(".js", "");

      console.log("Provider loading:", url);

      migrations[name] = await import(url);
    }

    return migrations;
  }
}
