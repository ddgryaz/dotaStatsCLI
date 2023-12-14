import { JSDOM } from "jsdom";
import { IAllGames } from "../types/IAllGames";
import { sortByPopularity } from "../utils/sortByPopularity";
import { IMostPopular } from "../types/IMostPopular";
import { IPlayerStats } from "../types/IPlayerStats";
import { IParserDotaBuffResult } from "../types/IParserDotaBuffResult";
import { sleep } from "../utils/sleep";
import { fetchData } from "./fetchData";
import { collectAllGames } from "./collectAllGames";
import { IAllArray } from "../types/IAllArray";
import { getTopCount } from "./getTopCount";
import { BaseError } from "../errors/baseError";
import { BanError } from "../errors/banError";

const matchesEndpoint: string =
  "https://www.dotabuff.com/players/REQUIRED_ID/matches?enhance=overview&page=PAGE_NUMBER";

export async function parserDotaBuff(
  id: number,
  gamesCount: number,
): Promise<IParserDotaBuffResult> {
  if (gamesCount <= 0) throw new Error("The value cannot be less than zero");
  if (!id) throw new Error("Required parameter");

  const pageCount: number = Math.ceil(gamesCount / 50);
  const TOTAL_TOP = getTopCount(gamesCount); // todo: адаптировать под неполный результат, в случае если заранее вышли из цикла запросов

  const allGames: IAllGames[] = [];

  const { html, status, success } = await fetchData(matchesEndpoint, id, 1);

  if (!success && status === 429) {
    throw new BanError(
      `Error: Too many requests. Status code: ${status}. Changing the IP address will probably help.`,
    );
  } else if (!success) {
    throw new BaseError(
      `Error: An error occurred while retrieving data. Status code: ${status}.`,
    );
  }

  const { document } = new JSDOM(html).window;

  // todo: добавить проверку на наличие данные, или на приватный профиль, или на существование профиля. В случае нахождения - выкидываем 404 с соответствующим текстом.

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

    if (!html || !success) throw new Error("Failed to get HTML source");

    // todo: if !success => break
    // todo: Здесь выкидываем ошибку, с уже существующими данными, ошибку транслируем вместе с данными в index.html

    const { document } = new JSDOM(html).window;

    const noDataTrigger: boolean | null =
      document
        .querySelector("table tbody tr td")
        ?.textContent?.trim()
        ?.toLowerCase()
        ?.includes("no data for this period") || null;

    if (noDataTrigger) {
      break;
    }

    const allGamesInPage: IAllGames[] = collectAllGames(document);

    allGames.push(...allGamesInPage);
    await sleep(2_000);
  }

  console.log(`Data done! - ${allGames.length}`);

  const winMatches: IAllGames[] = allGames.filter(
    (game) => game.result === "Won Match",
  );

  console.log("winMatches");

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

  console.log("allItems");

  const allHeroes: IAllArray[] = allGames
    .map((game) => {
      return {
        name: game.hero,
        avatar: game.heroAvatar,
      };
    })
    .flat();

  console.log("allHeroes");

  const mostPopularHeroesWithoutStats: IAllArray[] = sortByPopularity(allHeroes)
    .reduce((acc: IAllArray[], curr) => {
      if (!acc.find((v) => v.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [])
    .slice(0, TOTAL_TOP);

  console.log("mostPopularHeroesWithoutStats");

  // todo: здесь очень долго
  const mostPopularItemsWithoutStats: IAllArray[] = sortByPopularity(allItems)
    .reduce((acc: IAllArray[], curr) => {
      if (!acc.find((v) => v.name === curr.name)) {
        acc.push(curr);
      }
      return acc;
    }, [])
    .slice(0, TOTAL_TOP);

  console.log("mostPopularItemsWithoutStats");

  const mostPopularItems: IMostPopular[] = [];
  const mostPopularHeroes: IMostPopular[] = [];

  for (let i: number = 0; i < TOTAL_TOP; i++) {
    const coincidencesHero: IAllArray[] = sortByPopularity(allHeroes).filter(
      (el: IAllArray): boolean =>
        el.name === mostPopularHeroesWithoutStats[i].name,
    );

    const winRateForHero: IAllGames[] = winMatches.filter(
      (el: IAllGames): boolean =>
        el.hero === mostPopularHeroesWithoutStats[i].name,
    );

    const coincidencesItem: IAllArray[] = sortByPopularity(allItems).filter(
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

    mostPopularHeroes.push({
      hero: mostPopularHeroesWithoutStats[i].name,
      avatar: mostPopularHeroesWithoutStats[i].avatar,
      totalGames: `${coincidencesHero.length}/${allGames.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });

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

  console.log("LOOP FOR DONE");

  const playerStats: IPlayerStats = {
    totalGames: allGames.length,
    win: winMatches.length,
    lose: allGames.length - winMatches.length,
    overallWinRate:
      ((winMatches.length / allGames.length) * 100).toFixed(2) + "%",
    mostPopularHeroes,
    mostPopularItems,
  };

  // todo: проверить полный ли сбор, если нет выкинуть LargeNumberOfRequestsError с уже собранными данными

  return {
    playerName,
    avatarUrl,
    playerStats,
    // todo: не используется в визуализации? #1
    // allGames,
  };
}
