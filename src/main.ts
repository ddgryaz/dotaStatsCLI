import fastify from "fastify";
import ora from "ora";
import open from "open";
import { parserDotaBuff, TOTAL_TOP } from "./core/parserDotaBuff";
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

  http.get(`/${id}`, async (request, reply) => {
    if (data) {
      const validHtml = await readFile(
        path.join(__dirname, "..", "src", "templates", "index.html"),
        { encoding: "utf-8" },
      );

      const arrayHeroesForTable: string[] =
        data.playerStats.mostPopularHeroes.map((hero, index) => {
          return `
            <tr>
              <th>${index + 1}.</th>
              <th>
              <img
                src="${hero.avatar}"
                alt=""
                height="30px"
                width="49px"
                class="rectangle"
              />
              </th>
              <th>${hero.hero}</th>
              <th>${hero.totalGames}</th>
              <th>${hero.winRate}</th>
              <th>${hero["winRate%"]}</th>
            </tr>`;
        });

      const arrayItemsForTable: string[] =
        data.playerStats.mostPopularItems.map((item, index) => {
          return `
            <tr>
            <th>${index + 1}.</th>
            <th>
              <img
                src="${item.avatar}"
                alt=""
                height="30px"
                width="49px"
                class="rectangle"
              />
              </th>
              <th>${item.item}</th>
              <th>${item.totalGames}</th>
              <th>${item.winRate}</th>
              <th>${item["winRate%"]}</th>
            </tr>`;
        });

      let modifiedValidHtml = validHtml
        .replace("$NICKNAME", data.playerName)
        .replace("$AVATAR_URL", data.avatarUrl)
        .replace("$PLAYER_TOTALGAMES", data.playerStats.totalGames.toString())
        .replace("$PLAYER_WIN", data.playerStats.win.toString())
        .replace("$PLAYER_LOSE", data.playerStats.lose.toString())
        .replace("$PLAYER_WINRATE", data.playerStats.overallWinRate.toString())
        .replace("$ITEMS", "$ITEMS ".repeat(TOTAL_TOP))
        .replace("$HEROES", "$HEROES ".repeat(TOTAL_TOP));

      for (let i = 0; i < TOTAL_TOP; i++) {
        modifiedValidHtml = modifiedValidHtml.replace(
          "$ITEMS",
          arrayItemsForTable[i],
        );

        modifiedValidHtml = modifiedValidHtml.replace(
          "$HEROES",
          arrayHeroesForTable[i],
        );
      }

      reply.code(200).type("text/html; charset=utf-8").send(modifiedValidHtml);
    } else {
      console.log(11111111);
      // todo: send 404 template
      // const emptyHtml = await readFile(path.join(__dirname, "404.html"));
      // const x = validHtml.replace("NICKNAME", "GRYAZ");
      // reply.code(404).type("text/html; charset=utf-8").send(validHtml);
    }

    process.exit(0);
  });

  await http.listen({ host: HOST, port: PORT });
  await open(`http://localhost:${PORT}/${id}`);
}

main();
