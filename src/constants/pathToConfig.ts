import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PATH_TO_CONFIG = `${path.resolve(__dirname, "..", "config.json")}`;
