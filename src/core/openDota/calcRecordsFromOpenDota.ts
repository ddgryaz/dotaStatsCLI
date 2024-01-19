import { getRecords } from "../getRecords";
import { IAllMatches } from "./types/IAllMatches";
import { IRecords } from "../../types/IRecords";
import { getTimeFromSeconds } from "../../utils/getTimeFromSeconds";
import { getImageAndNameIOrH } from "./getImageAndNameIOrH";
import { sleep } from "../../utils/sleep";
import { gameModes } from "../../constants/gameModes";
import { MIN_DURATION } from "../../constants/minDuration";

const getMatchUrl = (matchId: number): string => {
  return "https://www.dotabuff.com/matches/".concat(matchId.toString());
};

export async function calcRecordsFromOpenDota(
  arrayWithGames: IAllMatches[],
  endpointForHeroName: string,
): Promise<IRecords> {
  const matchesWithRecords: { [key: string]: IAllMatches } = getRecords(
    arrayWithGames.filter((match) => {
      if (match.game_mode in gameModes && match.duration > MIN_DURATION)
        return match;
    }),
  ) as {
    [key: string]: IAllMatches;
  };

  for (const matchWithRecord of Object.values(matchesWithRecords)) {
    const { name } = await getImageAndNameIOrH(
      endpointForHeroName,
      matchWithRecord.hero_id,
    );

    matchWithRecord.hero_name = name;

    await sleep(2_000);
  }

  return {
    "Most Kills": {
      value: matchesWithRecords.gameWithRecordKills.kills,
      hero: matchesWithRecords.gameWithRecordKills.hero_name as string,
      matchUrl: getMatchUrl(matchesWithRecords.gameWithRecordKills.match_id),
      result: matchesWithRecords.gameWithRecordKills.result,
    },
    "Most Deaths": {
      value: matchesWithRecords.gameWithRecordDeaths.deaths,
      hero: matchesWithRecords.gameWithRecordDeaths.hero_name as string,
      matchUrl: getMatchUrl(matchesWithRecords.gameWithRecordDeaths.match_id),
      result: matchesWithRecords.gameWithRecordDeaths.result,
    },
    "Most Assists": {
      value: matchesWithRecords.gameWithRecordAssists.assists,
      hero: matchesWithRecords.gameWithRecordAssists.hero_name as string,
      matchUrl: getMatchUrl(matchesWithRecords.gameWithRecordAssists.match_id),
      result: matchesWithRecords.gameWithRecordAssists.result,
    },
    "Longest Match": {
      value: getTimeFromSeconds(
        matchesWithRecords.gameWithRecordDuration.duration,
      ),
      hero: matchesWithRecords.gameWithRecordDuration.hero_name as string,
      matchUrl: getMatchUrl(matchesWithRecords.gameWithRecordDuration.match_id),
      result: matchesWithRecords.gameWithRecordDuration.result,
    },
  };
}
