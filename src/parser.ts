import { parserDotaBuff } from "./core/parserDotaBuff";
import { writeFile } from "fs/promises";

(async function start() {
  await writeFile(
    "result.json",
    JSON.stringify(await parserDotaBuff(64015685, 100)),
  );
})();
