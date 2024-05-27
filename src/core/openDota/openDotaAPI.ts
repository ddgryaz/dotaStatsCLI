import { BaseError } from "../../errors/baseError.js";
import { getNameAndAvatar } from "./getNameAndAvatar.js";
import { getMatches } from "./getMatches.js";
import { getTopCount } from "../getTopCount.js";
import { IMostPopular } from "../dotaBuff/types/IMostPopular.js";
import { IPlayerStats } from "../dotaBuff/types/IPlayerStats.js";
import { IProviderResult } from "../../types/IProviderResult.js";
import { logger } from "../../utils/logger.js";
import { IAllMatches } from "./types/IAllMatches.js";
import { sortByPopularityNumbers } from "./sortByPopularityNumbers.js";
import { finalSortToTables } from "../../utils/finalSortToTables.js";
import { IRecords } from "../../types/IRecords.js";
import { calcRecordsFromOpenDota } from "./calcRecordsFromOpenDota.js";
import { ImpossibleGetDataError } from "../../errors/impossibleGetDataError.js";
import { HeroesAndItems } from "./heroesAndItems.js";
import { IHeroesAndItems } from "./types/IHeroesAndItems.js";

const providerHost = "https://api.opendota.com";
const playerEndpoint = `${providerHost}/api/players/REQUIRED_ID`;
const matchesEndpoint = `${providerHost}/api/players/REQUIRED_ID/matches?significant=0&project=item_0&project=item_1&project=item_2&project=item_3&project=item_4&project=item_5&project=hero_id&project=kills&project=deaths&project=assists&project=duration&project=game_mode&limit=GAMES_COUNT`;

export async function openDotaApi(
  id: number,
  gamesCount: number,
): Promise<IProviderResult> {
  if (gamesCount <= 0 || !gamesCount)
    throw new BaseError(
      "Error: gamesCount - the value cannot be less than zero.",
    );

  if (!id) throw new BaseError("Error: id - required parameter.");

  if (gamesCount < 50) gamesCount = 50;

  const { playerName, avatarUrl } = await getNameAndAvatar(id, playerEndpoint);

  const matches: IAllMatches[] = await getMatches(
    id,
    gamesCount,
    matchesEndpoint,
  );

  if (!matches.length) {
    throw new ImpossibleGetDataError(
      "Error: Player profile is private or does not exist.",
    );
  }

  logger.info(
    `Data collected - ${matches.length} games. Running data aggregation.`,
  );

  const TOTAL_TOP = getTopCount();

  const winMatches = matches.filter((match) => match.result === "Won Match");

  const allHeroesIds = matches.map((match) => {
    return match.hero_id;
  });

  const allItemsIds = matches
    .map((match) => {
      return match.items_ids;
    })
    .flat()
    .filter((item) => item !== null)
    .filter((item) => item !== 0);

  const mostPopularHeroIdsWithoutStats = Array.from(
    new Set(sortByPopularityNumbers(allHeroesIds)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItemIdsWithoutStats = Array.from(
    new Set(sortByPopularityNumbers(allItemsIds)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItems: IMostPopular[] = [];
  const mostPopularHeroes: IMostPopular[] = [];

  const TOTAL_TOP_HEROES: number =
    mostPopularHeroIdsWithoutStats.length <= TOTAL_TOP
      ? mostPopularHeroIdsWithoutStats.length
      : TOTAL_TOP;

  const TOTAL_TOP_ITEMS: number =
    mostPopularItemIdsWithoutStats.length <= TOTAL_TOP
      ? mostPopularItemIdsWithoutStats.length
      : TOTAL_TOP;

  logger.info("Matches won, popular heroes and items calculated.");

  const heroesAndItems = await HeroesAndItems.getInstance();

  const records: IRecords = await calcRecordsFromOpenDota(
    matches,
    heroesAndItems,
  );

  logger.info(`Calculated your records for ${matches.length} games.`);

  for (let i: number = 0; i < TOTAL_TOP_HEROES; i++) {
    const coincidencesHero = sortByPopularityNumbers(allHeroesIds).filter(
      (heroId) => heroId === mostPopularHeroIdsWithoutStats[i],
    );

    const winRateForHero = winMatches.filter(
      (match) => match.hero_id === mostPopularHeroIdsWithoutStats[i],
    );

    const heroInfo = heroesAndItems.heroes?.find(
      (hero: IHeroesAndItems) => hero.id === mostPopularHeroIdsWithoutStats[i],
    );

    mostPopularHeroes.push({
      name: heroInfo?.name || "No data",
      avatar: heroInfo?.avatar || "No data",
      totalGames: `${coincidencesHero.length}/${matches.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });
  }

  logger.info("Found the avatars and names of all you heroes.");

  for (let i: number = 0; i < TOTAL_TOP_ITEMS; i++) {
    const coincidencesItem = sortByPopularityNumbers(allItemsIds).filter(
      (itemId) => itemId === mostPopularItemIdsWithoutStats[i],
    );

    const winRateForItem = winMatches.filter((match) => {
      for (const itemId of match.items_ids) {
        if (itemId === mostPopularItemIdsWithoutStats[i]) {
          return true;
        }
      }
    });

    const itemInfo = heroesAndItems.items?.find(
      (item: IHeroesAndItems) => item.id === mostPopularItemIdsWithoutStats[i],
    );

    mostPopularItems.push({
      name: itemInfo?.name || "No data",
      avatar: itemInfo?.avatar || "No data",
      totalGames: `${coincidencesItem.length}/${matches.length}`,
      winRate: `${winRateForItem.length}/${coincidencesItem.length}`,
      "winRate%":
        ((winRateForItem.length / coincidencesItem.length) * 100).toFixed(2) +
        "%",
    });
  }

  logger.info("Found the avatars and names of all you items.");

  finalSortToTables(mostPopularHeroes);
  finalSortToTables(mostPopularItems);

  const playerStats: IPlayerStats = {
    totalGames: matches.length,
    win: winMatches.length,
    lose: matches.length - winMatches.length,
    overallWinRate:
      ((winMatches.length / matches.length) * 100).toFixed(2) + "%",
    mostPopularHeroes,
    mostPopularItems,
  };

  return {
    playerName,
    avatarUrl,
    playerStats,
    TOTAL_TOP_ITEMS,
    TOTAL_TOP_HEROES,
    records,
  };
}
