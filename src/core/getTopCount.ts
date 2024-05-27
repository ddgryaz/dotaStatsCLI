import { IConfig } from "../types/IConfig.js";
import { readFile } from "node:fs/promises";
import { PATH_TO_CONFIG } from "../constants/pathToConfig.js";

const config = JSON.parse(await readFile(PATH_TO_CONFIG, { encoding: "utf8" }));

export function getTopCount(): number {
  const CONFIG: IConfig = config;
  return CONFIG.rows || 10;
}
