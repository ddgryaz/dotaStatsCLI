import { JSDOM } from "jsdom";
import { IAllGames } from "../types/IAllGames";
import { sortByPopularity } from "../utils/sortByPopularity";
import { IMostPopular } from "../types/IMostPopular";
import { IPlayerStats } from "../types/IPlayerStats";
import { IParserDotaBuffResult } from "../types/IParserDotaBuffResult";
import { sleep } from "../utils/sleep";

const matchesEndpoint: string =
  "https://www.dotabuff.com/players/REQUIRED_ID/matches?enhance=overview&page=PAGE_NUMBER";

export async function parserDotaBuff(
  id: number,
  gamesCount: number,
): Promise<IParserDotaBuffResult[]> {
  if (gamesCount <= 0) throw new Error("The value cannot be less than zero");
  if (!id) throw new Error("Required parameter");

  const TOTAL_TOP: number = 5;

  const pageCount: number = Math.ceil(gamesCount / 50);

  const allGames: IAllGames[] = [];

  for (let i: number = 1; i <= pageCount; i++) {
    const { html, status } = await fetch(
      matchesEndpoint
        .replace("REQUIRED_ID", id.toString())
        .replace("PAGE_NUMBER", i.toString()),
      {
        method: "GET",
      },
    ).then(async (response) => {
      return {
        html: await response.text(),
        status: response.status,
      };
    });

    console.log(status)

    // TODO: обработать status, иногда приходит 429 (html = "Retry later")

    if (!html) throw new Error("Failed to get HTML source");

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

    const allGamesInPage: IAllGames[] = Array.from(
      document.querySelectorAll("table tbody tr"),
    ).map((gameRow) => {
      return {
        hero:
          gameRow.querySelector("td.cell-large a")?.textContent?.trim() || "",
        result:
          gameRow
            .querySelector("td.cell-centered.r-none-mobile + td a")
            ?.textContent?.trim() || "",
        items: Array.from(
          gameRow.querySelectorAll("td.r-none-tablet.cell-xxlarge div a"),
        ).map((link) => {
          return (
            link
              ?.getAttribute("href")
              ?.split("items/")?.[1]
              ?.replaceAll("-", " ") || ""
          );
        }),
      };
    });

    allGames.push(...allGamesInPage);
    await sleep(500);
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
      hero: mostPopularHeroesWithoutStats[i],
      totalGames: `${coincidencesHero.length}/${allGames.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });

    mostPopularItems.push({
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

  // const playerName: string =
  //   document
  //     .querySelector("div.header-content-title h1")
  //     ?.textContent?.trim()
  //     ?.replace("Матчи", "") || "";

  return [
    {
      // playerName,
      playerStats,
      allGames,
    },
  ];
}
