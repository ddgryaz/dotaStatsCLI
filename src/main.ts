import fastify from "fastify";
import ora from "ora";
import open from "open";
import { parserDotaBuff } from "./core/parserDotaBuff";
import * as process from "process";
import { readFile } from "fs/promises";
import * as path from "path";

const http = fastify();
const progressBar = ora();
const [id, totalGames]: string[] = [process.argv[2], process.argv[3]];
const HOST: string = "127.0.0.1";
const PORT: number = 6781;
async function main(): Promise<void> {
  progressBar.start("Get data...");
  const data = await parserDotaBuff(Number(id), Number(totalGames));
  progressBar.stop();

  // const data = null;

  http.get(`/${id}`, async (request, reply) => {
    const validHtml = await readFile(
      path.join(__dirname, "..", "src", "templates", "index.html"),
      { encoding: "utf-8" },
    );

    const modifiedValidHtml = validHtml
      .replace("$NICKNAME", "GRYAZ")
      .replace("$PLAYER_TOTALGAMES", data.playerStats.totalGames.toString())
      .replace("$PLAYER_WIN", data.playerStats.win.toString())
      .replace("$PLAYES_LOSE", data.playerStats.lose.toString())
      .replace("$PLAYER_WINRATE", data.playerStats.overallWinRate.toString())
      .replace(
        "$HEROES",
        // @ts-ignore
        data.playerStats.mostPopularHeroes.map((hero): string => {
          return `<tr>
              <th>${hero.hero}</th>
              <th>${hero.totalGames}</th>
              <th>${hero.winRate}</th>
              <th>${hero["winRate%"]}</th>
            </tr>`;
        }),
      )
      .replace(
        "$ITEMS",
        // @ts-ignore
        data.playerStats.mostPopularItems.map((item): string => {
          return `<tr>
              <th>${item.item}</th>
              <th>${item.totalGames}</th>
              <th>${item.winRate}</th>
              <th>${item["winRate%"]}</th>
            </tr>`;
        }),
      );

    if (data) {
      reply.code(200).type("text/html; charset=utf-8").send(modifiedValidHtml);
    } else {
      // const emptyHtml = await readFile(path.join(__dirname, "404.html"));
      // const x = validHtml.replace("NICKNAME", "GRYAZ");
      reply.code(404).type("text/html; charset=utf-8").send(validHtml);
    }

    process.exit(0);
  });

  await http.listen({ host: HOST, port: PORT });
  await open(`http://localhost:${PORT}/${id}`);
}

main();
