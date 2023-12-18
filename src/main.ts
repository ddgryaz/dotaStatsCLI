import fastify from "fastify";
import open from "open";
import { parserDotaBuff } from "./core/dotaBuff/parserDotaBuff";
import * as process from "process";
import { readFile } from "fs/promises";
import * as path from "path";
import { IProviderResult } from "./types/IProviderResult";
import { SaveDataError } from "./errors/saveDataError";
import { logger } from "./utils/logger";
import { openDotaApi } from "./core/openDota/openDotaAPI";
import inquirer from "inquirer";

const http = fastify();
const [id, totalGames]: string[] = [process.argv[2], process.argv[3]];
const HOST: string = "127.0.0.1";
const PORT: number = 6781;

/*
 * todo:
 *  Изменить верстку, чтобы не было скроллинга.
 *  Добавить логи к openDotaApi.
 *  Добавить подсказку к выбору провайдер (рекомендовано)
 *
 */

const providers = [
  {
    name: "openDota",
    value: openDotaApi,
  },
  {
    name: "dotaBuff",
    value: parserDotaBuff,
  },
];

async function main(): Promise<void> {
  const { service } = await inquirer.prompt([
    {
      type: "list",
      name: "service",
      message: "Select a data provider:",
      choices: providers,
    },
  ]);

  const provider = providers.find((el) => el.value === service);

  let data: IProviderResult | null;
  let error: string | null;

  logger.info("Start of data collection...");

  try {
    data = await service(Number(id), Number(totalGames));
    error = null;
  } catch (e) {
    if (e instanceof SaveDataError) {
      data = e.data;
      error = e.message;
    } else {
      data = null;
      error = e.message;
    }
  }

  logger.info("Creating a visualization.");

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

      const htmlBlockForProvider: string = `
            <div style="display: flex; justify-content: center">
                <h4>Your data provider - ${provider?.name}</h4>
            </div>`;

      let modifiedValidHtml = validHtml
        .replace("$NICKNAME", data.playerName)
        .replace("$PROVIDER", htmlBlockForProvider)
        .replace("$AVATAR_URL", data.avatarUrl)
        .replace("$PLAYER_TOTALGAMES", data.playerStats.totalGames.toString())
        .replace("$PLAYER_WIN", data.playerStats.win.toString())
        .replace("$PLAYER_LOSE", data.playerStats.lose.toString())
        .replace("$PLAYER_WINRATE", data.playerStats.overallWinRate.toString())
        .replace("$ITEMS", "$ITEMS ".repeat(data.TOTAL_TOP))
        .replace("$HEROES", "$HEROES ".repeat(data.TOTAL_TOP));

      for (let i = 0; i < data.TOTAL_TOP; i++) {
        modifiedValidHtml = modifiedValidHtml.replace(
          "$ITEMS",
          arrayItemsForTable[i],
        );

        modifiedValidHtml = modifiedValidHtml.replace(
          "$HEROES",
          arrayHeroesForTable[i],
        );
      }

      if (error) {
        const htmlBlockForError: string = `
            <div class="saveDataError" style="display: flex; justify-content: center">
                <blockquote>
                  We were unable to obtain all the requested data. We received an error.
                  <br />
                  The error text is shown below.
                  <br />
                  <b>$ERROR_MESSAGE</b>
                </blockquote>
            </div>`.replace("$ERROR_MESSAGE", error);

        modifiedValidHtml = modifiedValidHtml.replace(
          "$ERROR_BLOCK",
          htmlBlockForError,
        );
      } else {
        modifiedValidHtml = modifiedValidHtml.replace("$ERROR_BLOCK", "");
      }

      reply.code(200).type("text/html; charset=utf-8").send(modifiedValidHtml);
    } else {
      const validHtml = await readFile(
        path.join(__dirname, "..", "src", "templates", "errorTemplate.html"),
        { encoding: "utf-8" },
      );

      let modifiedValidHtml: string;

      if (error) {
        modifiedValidHtml = validHtml.replace("$ERROR_MESSAGE", error);
      } else {
        modifiedValidHtml = validHtml.replace(
          "$ERROR_MESSAGE",
          "Error: If you see this text, please report it to the app developers",
        );
      }

      reply.code(500).type("text/html; charset=utf-8").send(modifiedValidHtml);
    }

    process.exit(0);
  });

  await http.listen({ host: HOST, port: PORT });
  await open(`http://localhost:${PORT}/${id}`);
}

const start = performance.now();
main().then(() => {
  const end = performance.now();
  logger.info(
    `Program running time: ${((end - start) / 1000).toFixed(2)} seconds.`,
  );
});
