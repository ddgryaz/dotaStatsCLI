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
import { APPLICATION_NAME } from "./constants/applicationName";
import { ROUTER_NAME } from "./constants/routerName";
import { fastifyStatic } from "@fastify/static";
import { sleep } from "./utils/sleep";
import { TIME_TO_CLOSE_APP } from "./constants/timeToCloseApp";
import { getDateTime } from "./utils/getDateTime";
import { IRecord } from "./types/IRecords";

const http = fastify();
const [id, totalGames]: string[] = [process.argv[2], process.argv[3]];
const HOST: string = "127.0.0.1";
const PORT: number = 6781;

/*
 * todo:
 *  Изменить верстку, чтобы не было скроллинга.
 *  Добавить подсказку к выбору провайдер (рекомендовано).
 *  Обработать ошибку при отсутствии интернет соединения.
 *  Добавить на визуализацию время создания данных.
 *
 * todo:
 *  Добавление рекордов по собранным играм, c предоставлением ссылки на dotabuff, например так (https://www.dotabuff.com/players/64015685/records),
 *  дефолтный объект с open-dota (без ?project) содержит такие данные:
 *  {
 *		"match_id": 7385509323,
 *		"player_slot": 1,
 *		"radiant_win": false,
 *		"duration": 2610, | Самая длительная игра в секундах
 *		"game_mode": 22,
 *		"lobby_type": 7,
 *		"hero_id": 126, | Здесь взять avatar героя
 *		"start_time": 1697492360,
 *		"version": null,
 *		"kills": 11, | Больше всего убийств
 *		"deaths": 6, | Больше всего смертей
 *		"assists": 6, | Больше всего ассистов
 *		"skill": null,
 *		"average_rank": 34,
 *		"leaver_status": 0,
 *		"party_size": null
 *	 }
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
  const FULL_ROUTER_NAME: string = ROUTER_NAME.replace(
    "$PROVIDER",
    provider?.name as string,
  ).replace("$ID", id);

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

  const dateTime: string = getDateTime();

  /*
   * Connecting common public directories for statics.
   * For submitting to the main page and for submitting to the error page.
   */

  http.register(fastifyStatic, {
    root: path.join(__dirname, "..", "src", "templates", "styles"),
    prefix: "/styles/",
  });

  http.register(fastifyStatic, {
    root: path.join(__dirname, "..", "src", "templates", "images"),
    prefix: "/images/",
    decorateReply: false,
  });

  http.get(FULL_ROUTER_NAME + "/styles/index.css", function (req, reply) {
    reply.sendFile(
      path.join(__dirname, "..", "src", "templates", "styles", "index.css"),
    );
  });

  http.get(FULL_ROUTER_NAME + "/images/dotaBg.jpeg", function (req, reply) {
    reply.sendFile(
      path.join(__dirname, "..", "src", "templates", "images", "dotaBg.jpeg"),
    );
  });

  if (!data) {
    /*
     * Sending static for the error page.
     */

    http.get(FULL_ROUTER_NAME + "/images/sadHero.png", function (req, reply) {
      reply.sendFile(
        path.join(__dirname, "..", "src", "templates", "images", "sadHero.png"),
      );
    });

    http.get(FULL_ROUTER_NAME + "/images/bg.png", function (req, reply) {
      reply.sendFile(
        path.join(__dirname, "..", "src", "templates", "images", "bg.png"),
      );
    });
  } else {
    /*
     * Connecting and sending a static js file for animations.
     * Only used on the home page.
     */

    http.register(fastifyStatic, {
      root: path.join(__dirname, "..", "src", "templates", "js"),
      prefix: "/js/",
      decorateReply: false,
    });

    http.get(FULL_ROUTER_NAME + "/js/wow.min.js", function (req, reply) {
      reply.sendFile(
        path.join(__dirname, "..", "src", "templates", "js", "wow.min.js"),
      );
    });
  }

  http.get(FULL_ROUTER_NAME, async (request, reply) => {
    if (data) {
      const validHtml = await readFile(
        path.join(__dirname, "..", "src", "templates", "html", "index.html"),
        { encoding: "utf-8" },
      );

      const recordsBlocks: string[] = Object.entries(data.records).map(
        (record: [string, IRecord]): string => {
          const [key, value]: [string, IRecord] = record;

          return `
          <a class="player__item" href="${value.matchUrl}" target="_blank">
            <div class="player__image-filter"></div>
            <img src="/images/dotaBg.jpeg" alt="" />
            <ul class="player__item-list">
              <li>
                <p class="record-value">${key}</p>
              </li>
              <li>
                <p class="record-number">${value.value}</p>
              </li>
              <li>
              <p class="record-value">${value.hero}</p>
              </li>
              <li>
                <p class=${
                  value.result === "Won Match"
                    ? "record-text-won"
                    : "record-text-lost"
                }>${value.result}</p>
              </li>
            </ul>
          </a>`;
        },
      );

      const arrayHeroesForTable: string[] =
        data.playerStats.mostPopularHeroes.map((hero, index) => {
          return `
          <tr>
            <th>${index + 1}.</th>
            <th class="table-image">
              <img src="${hero.avatar}" alt="" />
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
            <th class="table-image">
              <img src="${item.avatar}" alt="" />
            </th>
            <th>${item.item}</th>
            <th>${item.totalGames}</th>
            <th>${item.winRate}</th>
            <th>${item["winRate%"]}</th>
          </tr>`;
        });

      const htmlBlockForProvider: string = `
            <div style="display: flex; justify-content: center">
                <h4>Your data provider - ${provider?.name?.toUpperCase()}</h4>
            </div>`;

      let modifiedValidHtml = validHtml
        .replaceAll("$APPNAME", APPLICATION_NAME)
        .replace("$NICKNAME", data.playerName)
        .replace("$DATETIME", dateTime)
        .replace("$PROVIDER", htmlBlockForProvider)
        .replace("$AVATAR_URL", data.avatarUrl)
        .replace("$PLAYER_TOTALGAMES", data.playerStats.totalGames.toString())
        .replace("$PLAYER_WIN", data.playerStats.win.toString())
        .replace("$PLAYER_LOSE", data.playerStats.lose.toString())
        .replace("$PLAYER_WINRATE", data.playerStats.overallWinRate.toString())
        .replace("$ITEMS", "$ITEMS ".repeat(data.TOTAL_TOP))
        .replace("$HEROES", "$HEROES ".repeat(data.TOTAL_TOP))
        .replace("$RECORDS", "$RECORDS ".repeat(recordsBlocks.length));

      for (let i = 0; i < recordsBlocks.length; i++) {
        modifiedValidHtml = modifiedValidHtml.replace(
          "$RECORDS",
          recordsBlocks[i],
        );
      }

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
            <ul class="top-app__error">
              <li>
                <p class="top-app__error-text">
                  We were unable to obtain all the requested data. We received an error.
                </p>
              </li>
              <li>
                <p class="top-app__error-text">The error text is shown below.</p>
              </li>
              <li>
                <p class="top-app__error-title">
                  $ERROR_MESSAGE
                </p>
              </li>
            </ul>`.replace("$ERROR_MESSAGE", error);

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
        path.join(__dirname, "..", "src", "templates", "html", "error.html"),
        { encoding: "utf-8" },
      );

      let modifiedValidHtml: string;

      if (error) {
        modifiedValidHtml = validHtml
          .replace("$ERROR_MESSAGE", error)
          .replaceAll("$APPNAME", APPLICATION_NAME);
      } else {
        modifiedValidHtml = validHtml
          .replace(
            "$ERROR_MESSAGE",
            "Error: If you see this text, please report it to the app developers",
          )
          .replaceAll("$APPNAME", APPLICATION_NAME);
      }

      reply.code(500).type("text/html; charset=utf-8").send(modifiedValidHtml);
    }

    logger.info(
      `Application will exit in ${
        TIME_TO_CLOSE_APP / 1000
      } seconds. See you soon!`,
    );

    await sleep(TIME_TO_CLOSE_APP);
    process.exit(0);
  });

  await http.listen({ host: HOST, port: PORT });
  await open(`http://localhost:${PORT}${FULL_ROUTER_NAME}`);
}

const start = performance.now();
main().then(() => {
  const end = performance.now();
  logger.info(
    `Program running time: ${((end - start) / 1000).toFixed(2)} seconds.`,
  );
});
