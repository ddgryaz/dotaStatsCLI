#!/usr/bin/env node

import fastify from "fastify";
import open from "open";
import { parserDotaBuff } from "./core/dotaBuff/parserDotaBuff";
import * as process from "process";
import { readFile } from "fs/promises";
import { writeFileSync } from "fs";
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
import { checkNetworkConnection } from "./utils/checkNetworkConnection";
import { INTRODUCTION_TEXT } from "./constants/introductionText";
import config from "./config.json";
import { IConfig } from "./types/IConfig";
import { PATH_TO_CONFIG } from "./constants/pathToConfig";
import { Validator } from "./utils/validator";

const http = fastify();
let [id, totalGames]: string[] = [process.argv[2], process.argv[3]];
const HOST: string = "127.0.0.1";
const CONFIG: IConfig = config;
const PORT: number = CONFIG.port || 6781;

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
  console.log(INTRODUCTION_TEXT);

  console.log(`The configuration file is here - ${PATH_TO_CONFIG}\n`);

  if (!id && !totalGames && CONFIG && CONFIG.players?.length) {
    const { playerId, matchesCount } = await inquirer.prompt([
      {
        type: "list",
        name: "playerId",
        message: "Configuration file detected! Select a player from the list:",
        choices: CONFIG.players.map((player) => {
          return { name: player.playerName, value: player.id };
        }),
      },
      {
        type: "input",
        name: "matchesCount",
        message: "Enter number of matches:",
        default: 200,
        validate: Validator.inputMatchCountValidator,
      },
    ]);

    id = playerId;
    totalGames = matchesCount;
  }

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

  try {
    await checkNetworkConnection();
    Validator.checkArgs(id, totalGames);

    const searchPlayer = CONFIG.players?.find(
      (player) => player.id === Number(id),
    );

    if (!searchPlayer) {
      const { answerForSavePlayer } = await inquirer.prompt([
        {
          type: "list",
          name: "answerForSavePlayer",
          message: `Save player (${id}) in config file?:`,
          choices: [
            { name: "Yes", value: true },
            { name: "No", value: false },
          ],
        },
      ]);

      if (answerForSavePlayer) {
        const { playerNameForSave } = await inquirer.prompt([
          {
            type: "input",
            name: "playerNameForSave",
            message: "Enter player name:",
            validate: Validator.inputPlayerNameValidator,
          },
        ]);

        CONFIG.players?.push({
          playerName: playerNameForSave,
          id: Number(id),
        });

        writeFileSync(
          path.join(__dirname, "config.json"),
          JSON.stringify(CONFIG),
        );
      }
    } else {
      logger.info(`The player is already known - ${searchPlayer.playerName}`);
    }

    logger.info("Start of data collection...");

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

  http.get(FULL_ROUTER_NAME + "/images/icon.png", function (req, reply) {
    reply.sendFile(
      path.join(__dirname, "..", "src", "templates", "images", "icon.png"),
    );
  });

  http.get(FULL_ROUTER_NAME + "/styles/index.css", function (req, reply) {
    reply.sendFile(
      path.join(__dirname, "..", "src", "templates", "styles", "index.css"),
    );
  });

  if (!data) {
    /*
     * Sending static for the error page.
     */

    http.get(
      FULL_ROUTER_NAME + "/images/errorImage.png",
      function (req, reply) {
        reply.sendFile(
          path.join(
            __dirname,
            "..",
            "src",
            "templates",
            "images",
            "errorImage.png",
          ),
        );
      },
    );

    http.get(
      FULL_ROUTER_NAME + "/images/backgroundError.jpg",
      function (req, reply) {
        reply.sendFile(
          path.join(
            __dirname,
            "..",
            "src",
            "templates",
            "images",
            "backgroundError.jpg",
          ),
        );
      },
    );
  } else {
    /*
     * Sending an image. Only used on the home page.
     */

    http.get(
      FULL_ROUTER_NAME + "/images/backgroundRecords.jpg",
      function (req, reply) {
        reply.sendFile(
          path.join(
            __dirname,
            "..",
            "src",
            "templates",
            "images",
            "backgroundRecords.jpg",
          ),
        );
      },
    );
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
            <img src="/images/backgroundRecords.jpg" alt="" />
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

      const htmlBlockForProvider: string = `Your data provider - ${provider?.name?.toUpperCase()}`;

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
