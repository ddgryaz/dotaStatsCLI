import { IConfig } from "../types/IConfig.js";
import { readFileSync } from "node:fs";
import { PATH_TO_CONFIG } from "../constants/pathToConfig.js";

export class Config {
  private static _instance: Config;
  private readonly _config: IConfig;

  private constructor() {
    this._config = JSON.parse(
      readFileSync(PATH_TO_CONFIG, { encoding: "utf8" }),
    );
  }

  static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }

  public get config() {
    return this._config;
  }
}
