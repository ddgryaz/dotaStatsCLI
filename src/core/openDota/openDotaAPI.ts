import { BaseError } from "../../errors/baseError";
import { getNameAndAvatar } from "./getNameAndAvatar";
import { getMatches } from "./getMatches";
import { getTopCount } from "../getTopCount";
import { IMostPopular } from "../dotaBuff/types/IMostPopular";
import { getImageAndNameIOrH } from "./getImageAndNameIOrH";
import { IPlayerStats } from "../dotaBuff/types/IPlayerStats";
import { sleep } from "../../utils/sleep";
import { IProviderResult } from "../../types/IProviderResult";
import { logger } from "../../utils/logger";
import { IAllMatches } from "./types/IAllMatches";
import { sortByPopularityNumbers } from "./sortByPopularityNumbers";
import { finalSortToTables } from "../../utils/finalSortToTables";
import { IRecords } from "../../types/IRecords";
import { calcRecordsFromOpenDota } from "./calcRecordsFromOpenDota";

const providerHost = "https://api.opendota.com";
const playerEndpoint = `${providerHost}/api/players/REQUIRED_ID`;
const matchesEndpoint = `${providerHost}/api/players/REQUIRED_ID/matches?significant=0&project=item_0&project=item_1&project=item_2&project=item_3&project=item_4&project=item_5&project=hero_id&project=kills&project=deaths&project=assists&project=duration&limit=GAMES_COUNT`;
const heroesInfoEndpoint = `${providerHost}/api/constants/heroes`;
const itemsInfoEndpoint = `${providerHost}/api/constants/items`;

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

  logger.info(
    `Data collected - ${matches.length} games. Running data aggregation.`,
  );

  // todo: выкинуть предупреждение, что мы собрали все доступные игры

  const TOTAL_TOP = getTopCount(matches.length);

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

  logger.info("Matches won, popular heroes and items calculated.");

  const records: IRecords = await calcRecordsFromOpenDota(
    matches,
    heroesInfoEndpoint,
  );

  logger.info(`Calculated your records for ${matches.length} games.`);

  for (let i: number = 0; i < TOTAL_TOP; i++) {
    const coincidencesHero = sortByPopularityNumbers(allHeroesIds).filter(
      (heroId) => heroId === mostPopularHeroIdsWithoutStats[i],
    );

    const winRateForHero = winMatches.filter(
      (match) => match.hero_id === mostPopularHeroIdsWithoutStats[i],
    );

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

    const heroInfo = await getImageAndNameIOrH(
      heroesInfoEndpoint,
      mostPopularHeroIdsWithoutStats[i],
    );

    await sleep(2_000);

    const itemInfo = await getImageAndNameIOrH(
      itemsInfoEndpoint,
      mostPopularItemIdsWithoutStats[i],
    );

    mostPopularHeroes.push({
      hero: heroInfo.name,
      avatar: heroInfo.avatar,
      totalGames: `${coincidencesHero.length}/${matches.length}`,
      winRate: `${winRateForHero.length}/${coincidencesHero.length}`,
      "winRate%":
        ((winRateForHero.length / coincidencesHero.length) * 100).toFixed(2) +
        "%",
    });

    mostPopularItems.push({
      item: itemInfo.name,
      avatar: itemInfo.avatar,
      totalGames: `${coincidencesItem.length}/${matches.length}`,
      winRate: `${winRateForItem.length}/${coincidencesItem.length}`,
      "winRate%":
        ((winRateForItem.length / coincidencesItem.length) * 100).toFixed(2) +
        "%",
    });
  }

  finalSortToTables(mostPopularHeroes);
  finalSortToTables(mostPopularItems);

  logger.info("A rating of items and heroes has been formed.");

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
    TOTAL_TOP,
    records,
  };
}
