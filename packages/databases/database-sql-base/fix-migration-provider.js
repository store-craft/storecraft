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

      // resolve absolute path to ensure cross-platform consistency
      const fullPath = this.path.resolve(this.migrationFolder, file);

      /**
       * Convert file path to file URL using Node's built-in utility.
       * This avoids manual string manipulation (like regex) and ensures
       * correct behavior across Windows, Linux, and macOS.
       */
      const fileUrl = pathToFileURL(fullPath).href;

      const name = file.replace(".js", "");

      console.log("Provider loading:", fileUrl);

      migrations[name] = await import(fileUrl);
    }

    return migrations;
  }
}
