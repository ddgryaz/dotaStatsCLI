import config from "../config.json";
import { IConfig } from "../types/IConfig";

export function getTopCount(): number {
  const CONFIG: IConfig = config;
  return CONFIG.rows || 10;
}
