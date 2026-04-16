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

    /** @type {Record<string, any>} */
    const migrations = {};

    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const full = this.path.join(this.migrationFolder, file);
      let url = pathToFileURL(full).href;

      // fix for Windows file URL issues
      url = url.replace(/^file:\/\/\//, "file:///");

      const name = file.replace(".js", "");

      console.log("Provider loading:", url);

      migrations[name] = await import(url);
    }

    return migrations;
  }
}
