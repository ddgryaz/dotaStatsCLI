import { Config } from "./config.js";

export function getTopCount(): number {
  const CONFIG = Config.getInstance().config;
  return CONFIG.rows || 10;
}
