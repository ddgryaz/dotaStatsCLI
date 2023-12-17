import { BaseError } from "../../errors/baseError";
import { getNameAndAvatar } from "./getNameAndAvatar";
import { getMatches } from "./getMatches";
import { getTopCount } from "../getTopCount";
import { sortByPopularity } from "../../utils/sortByPopularity";
import { IMostPopular } from "../dotaBuff/types/IMostPopular";
import { getImageAndNameIOrH } from "./getImageAndNameIOrH";
import { IPlayerStats } from "../dotaBuff/types/IPlayerStats";
import { sleep } from "../../utils/sleep";

const providerHost = "https://api.opendota.com";
const playerEndpoint = `${providerHost}/api/players/REQUIRED_ID`;
const matchesEndpoint = `${providerHost}/api/players/REQUIRED_ID/matches?significant=0&project=item_0&project=item_1&project=item_2&project=item_3&project=item_4&project=item_5&project=hero_id&project=game_mode&limit=GAMES_COUNT`;
const heroesInfoEndpoint = `${providerHost}/api/constants/heroes`;
const itemsInfoEndpoint = `${providerHost}/api/constants/items`;

export async function openDotaApi(id: number, gamesCount: number) {
  if (gamesCount <= 0 || !gamesCount)
    throw new BaseError(
      "Error: gamesCount - the value cannot be less than zero.",
    );

  if (!id) throw new BaseError("Error: id - required parameter.");

  if (gamesCount < 50) gamesCount = 50;

  const { playerName, avatarUrl } = await getNameAndAvatar(id, playerEndpoint);

  const matches = await getMatches(id, gamesCount, matchesEndpoint);

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
    new Set(sortByPopularity(allHeroesIds)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItemIdsWithoutStats = Array.from(
    new Set(sortByPopularity(allItemsIds)),
  ).slice(0, TOTAL_TOP);

  const mostPopularItems: IMostPopular[] = [];
  const mostPopularHeroes: IMostPopular[] = [];

  for (let i: number = 0; i < TOTAL_TOP; i++) {
    const coincidencesHero = sortByPopularity(allHeroesIds).filter(
      (heroId) => heroId === mostPopularHeroIdsWithoutStats[i],
    );

    const winRateForHero = winMatches.filter(
      (match) => match.hero_id === mostPopularHeroIdsWithoutStats[i],
    );

    const coincidencesItem = sortByPopularity(allItemsIds).filter(
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
  };
}
