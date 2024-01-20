import { JSDOM } from "jsdom";
import { IAllGames } from "./types/IAllGames";
import { IMostPopular } from "./types/IMostPopular";
import { IPlayerStats } from "./types/IPlayerStats";
import { IProviderResult } from "../../types/IProviderResult";
import { sleep } from "../../utils/sleep";
import { fetchData } from "./fetchData";
import { collectAllGames } from "./collectAllGames";
import { IAllArray } from "./types/IAllArray";
import { getTopCount } from "../getTopCount";
import { BaseError } from "../../errors/baseError";
import { BanError } from "../../errors/banError";
import { SaveDataError } from "../../errors/saveDataError";
import { logger } from "../../utils/logger";
import { ImpossibleGetDataError } from "../../errors/impossibleGetDataError";
import { calcRecordsFromDotaBuff } from "./calcRecordsFromDotaBuff";
import { IRecords } from "../../types/IRecords";
import { sortByPopularityObjects } from "./sortByPopularityObjects";
import { finalSortToTables } from "../../utils/finalSortToTables";

const matchesEndpoint: string =
  "https://www.dotabuff.com/players/REQUIRED_ID/matches?enhance=overview&page=PAGE_NUMBER";

export async function parserDotaBuff(
  id: number,
  gamesCount: number,
): Promise<IProviderResult> {
  if (gamesCount <= 0 || !gamesCount)
    throw new BaseError(
      "Error: gamesCount - the value cannot be less than zero.",
    );

  if (!id) throw new BaseError("Error: id - required parameter.");

  const pageCount: number = Math.ceil(gamesCount / 50);

  let aborted: {
    aborted: boolean;
    pageNumber: number | null;
    status: number | null;
  } = {
    aborted: false,
    pageNumber: null,
    status: null,
  };

  const allGames: IAllGames[] = [];

  const { html, status, success } = await fetchData(matchesEndpoint, id, 1);

  if (!success && status === 429) {
    throw new BanError(
      `Error: Too many requests. You have probably been blocked from www.dotabuff.com. Status code: ${status}. Changing the IP address will probably help.`,
    );
  } else if (!success) {
    throw new BaseError(
      `Error: An error occurred while retrieving data. Status code: ${status}.`,
    );
  }

  const { document } = new JSDOM(html).window;

  const privateProfile =
    document
      .querySelector("div.intro.intro-smaller h1")
      ?.textContent?.trim()
      ?.toLowerCase()
      ?.includes("profile is private") || false;

  const notFoundPage =
    document
      .querySelector("h2[id='status']")
      ?.textContent?.trim()
      ?.toLowerCase()
      ?.includes("not found") || false;

  if (privateProfile || notFoundPage) {
    throw new ImpossibleGetDataError(
      "Error: Player profile is private or does not exist.",
    );
  }

  const playerName: string =
    document
      .querySelector("div.header-content-title h1")
      ?.textContent?.trim()
      ?.replace("Matches", "") || "";

  const avatarUrl: string =
    document.querySelector("div.header-content a img")?.getAttribute("src") ||
    "";

  const allGamesInPage: IAllGames[] = collectAllGames(document);

  allGames.push(...allGamesInPage);
  await sleep(2_000);

  for (let i: number = 2; i <= pageCount; i++) {
    const { html, success, status } = await fetchData(matchesEndpoint, id, i);

    if (!success) {
      aborted = { aborted: true, pageNumber: i, status };
      break;
    }

    const { document } = new JSDOM(html).window;

    const noDataTrigger: boolean =
      document
        .querySelector("table tbody tr td")
        ?.textContent?.trim()
        ?.toLowerCase()
        ?.includes("no data for this period") || false;

    if (noDataTrigger) {
      break;
    }

    const allGamesInPage: IAllGames[] = collectAllGames(document);

    allGames.push(...allGamesInPage);
    await sleep(2_000);
  }

  logger.info(
    `Data collected - ${allGames.length} games. Running data aggregation.`,
  );

  const winMatches: IAllGames[] = allGames.filter(
    (game) => game.result === "Won Match",
  );

  logger.info("Calculated matches won!");

  const allItems: IAllArray[] = allGames
    .map((game) => {
      return game.items.map((item) => {
        return {
          name: item.name,
          avatar: item.avatar,
        };
      });
    })
    .flat();

  logger.info("Found all the items.");

  const allHeroes: IAllArray[] = allGames
    .map((game) => {
      return {
        name: game.hero,
        avatar: game.heroAvatar,
      };
    })
    .flat()
    .filter((hero) => {
      if (hero.name.toLowerCase() !== "no hero") {
        return hero;
      }
    });

  logger.info("Found all the heroes.");

  const TOTAL_TOP: number = getTopCount(allGames.length);

  const mostPopularHeroesWithoutStats: IAllArray[] = sortByPopularityObjects(
    allHeroes,
  )
    .reduce((acc: IAllArray[], curr) => {
      if (!acc.find((v) => v.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [])
    .slice(0, TOTAL_TOP);

  logger.info("Made a top list of your heroes.");

  const mostPopularItemsWithoutStats: IAllArray[] = sortByPopularityObjects(
    allItems,
  )
    .reduce((acc: IAllArray[], curr) => {
      if (!acc.find((v) => v.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [])
    .slice(0, TOTAL_TOP);

  logger.info("Made a top list of your items.");

  const records: IRecords = calcRecordsFromDotaBuff(allGames);

  logger.info(`Calculated your records for ${allGames.length} games.`);

  const mostPopularItems: IMostPopular[] = [];
  const mostPopularHeroes: IMostPopular[] = [];

  const TOTAL_TOP_HEROES: number =
    mostPopularHeroesWithoutStats.length <= TOTAL_TOP
      ? mostPopularHeroesWithoutStats.length
      : TOTAL_TOP;

  const TOTAL_TOP_ITEMS: number =
    mostPopularItemsWithoutStats.length <= TOTAL_TOP
      ? mostPopularItemsWithoutStats.length
      : TOTAL_TOP;

  for (let i: number = 0; i < TOTAL_TOP_HEROES; i++) {
    const coincidencesHero: IAllArray[] = sortByPopularityObjects(
      allHeroes,
    ).filter(
      (el: IAllArray): boolean =>
        el.name === mostPopularHeroesWithoutStats[i].name,
    );

    const winRateForHero: IAllGames[] = winMatches.filter(
      (el: IAllGames): boolean =>
        el.hero === mostPopularHeroesWithoutStats[i].name,
    );

    mostPopularHeroes.push({
      hero: mostPopularHeroesWithoutStats[i].name,
      avatar: mostPopularHeroesWithoutStats[i].avatar,
      totalGames: `${coincidencesHero.length}/${allGames.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });
  }

  for (let i: number = 0; i < TOTAL_TOP_ITEMS; i++) {
    const coincidencesItem: IAllArray[] = sortByPopularityObjects(
      allItems,
    ).filter(
      (el: IAllArray): boolean =>
        el.name === mostPopularItemsWithoutStats[i].name,
    );

    const winRateForItem: IAllGames[] = winMatches.filter(
      (el: IAllGames): boolean | void => {
        for (const itemName of el.items) {
          if (itemName.name === mostPopularItemsWithoutStats[i].name) {
            return true;
          }
        }
      },
    );

    mostPopularItems.push({
      item: mostPopularItemsWithoutStats[i].name,
      avatar: mostPopularItemsWithoutStats[i].avatar,
      totalGames: `${coincidencesItem.length}/${allGames.length}`,
      winRate: `${winRateForItem.length}/${coincidencesItem.length}`,
      "winRate%":
        ((winRateForItem.length / coincidencesItem.length) * 100).toFixed(2) +
        "%",
    });
  }

  finalSortToTables(mostPopularHeroes);
  finalSortToTables(mostPopularItems);

  const playerStats: IPlayerStats = {
    totalGames: allGames.length,
    win: winMatches.length,
    lose: allGames.length - winMatches.length,
    overallWinRate:
      ((winMatches.length / allGames.length) * 100).toFixed(2) + "%",
    mostPopularHeroes,
    mostPopularItems,
  };

  logger.info("Aggregated your items and heroes!");

  const result: IProviderResult = {
    playerName,
    avatarUrl,
    playerStats,
    TOTAL_TOP_HEROES,
    TOTAL_TOP_ITEMS,
    records,
  };

  if (aborted.aborted && aborted.pageNumber !== null) {
    throw new SaveDataError(
      `Error: We were able to collect ${
        (aborted.pageNumber - 1) * 50
      }/${gamesCount} games. Other requests were blocked. Status code - ${
        aborted.status
      }`,
      result,
    );
  }

  return result;
}
