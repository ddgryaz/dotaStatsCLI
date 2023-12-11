import { JSDOM } from "jsdom";
import { IAllGames } from "../types/IAllGames";
import { sortByPopularity } from "../utils/sortByPopularity";
import { IMostPopular } from "../types/IMostPopular";
import { IPlayerStats } from "../types/IPlayerStats";
import { IParserDotaBuffResult } from "../types/IParserDotaBuffResult";
import { sleep } from "../utils/sleep";
import { fetchData } from "./fetchData";
import { collectAllGames } from "./collectAllGames";

const matchesEndpoint: string =
  "https://www.dotabuff.com/players/REQUIRED_ID/matches?enhance=overview&page=PAGE_NUMBER";

export const TOTAL_TOP: number = 5;

export async function parserDotaBuff(
  id: number,
  gamesCount: number,
): Promise<IParserDotaBuffResult> {
  if (gamesCount <= 0) throw new Error("The value cannot be less than zero");
  if (!id) throw new Error("Required parameter");

  const pageCount: number = Math.ceil(gamesCount / 50);

  const allGames: IAllGames[] = [];

  const { html, success } = await fetchData(matchesEndpoint, id, 1);

  if (!html || !success) throw new Error("Failed to get HTML source");

  const { document } = new JSDOM(html).window;

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
  await sleep(2000);

  for (let i: number = 2; i <= pageCount; i++) {
    const { html, success } = await fetchData(matchesEndpoint, id, i);

    if (!html || !success) throw new Error("Failed to get HTML source");

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
    await sleep(2000);
  }

  const winMatches: IAllGames[] = allGames.filter(
    (game) => game.result === "Won Match",
  );
  const allItems: string[] = allGames.map((item) => item.items).flat();
  const allHeroes: string[] = allGames.map((hero) => hero.hero).flat();

  const mostPopularHeroesWithoutStats: string[] = Array.from(
    new Set(sortByPopularity(allHeroes)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItemsWithoutStats: string[] = Array.from(
    new Set(sortByPopularity(allItems)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItems: IMostPopular[] = [];
  const mostPopularHeroes: IMostPopular[] = [];

  for (let i: number = 0; i < TOTAL_TOP; i++) {
    const coincidencesHero: string[] = sortByPopularity(allHeroes).filter(
      (hero: string): boolean => hero === mostPopularHeroesWithoutStats[i],
    );

    const winRateForHero: IAllGames[] = winMatches.filter(
      (el: IAllGames): boolean => el.hero === mostPopularHeroesWithoutStats[i],
    );

    const coincidencesItem: string[] = sortByPopularity(allItems).filter(
      (item: string): boolean => item === mostPopularItemsWithoutStats[i],
    );

    const winRateForItem: IAllGames[] = winMatches.filter(
      (el: IAllGames): boolean | void => {
        if (el.items.includes(mostPopularItemsWithoutStats[i])) {
          return true;
        }
      },
    );

    mostPopularHeroes.push({
      // todo: avatar
      hero: mostPopularHeroesWithoutStats[i],
      totalGames: `${coincidencesHero.length}/${allGames.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });

    mostPopularItems.push({
      // todo: avatar
      item: mostPopularItemsWithoutStats[i],
      totalGames: `${coincidencesItem.length}/${allGames.length}`,
      winRate: `${winRateForItem.length}/${coincidencesItem.length}`,
      "winRate%":
        ((winRateForItem.length / coincidencesItem.length) * 100).toFixed(2) +
        "%",
    });
  }

  const playerStats: IPlayerStats = {
    totalGames: allGames.length,
    win: winMatches.length,
    lose: allGames.length - winMatches.length,
    overallWinRate:
      ((winMatches.length / allGames.length) * 100).toFixed(2) + "%",
    mostPopularHeroes,
    mostPopularItems,
  };

  return {
    playerName,
    avatarUrl,
    playerStats,
    allGames,
  };
}
