import { IAllGames } from "./types/IAllGames";
import { IRecords } from "../../types/IRecords";
import { getRecords } from "../getRecords";

export function calcRecordsFromDotaBuff(arrayWithGames: IAllGames[]): IRecords {
  const {
    gameWithRecordKills,
    gameWithRecordDeaths,
    gameWithRecordAssists,
    gameWithRecordDuration,
  } = getRecords(arrayWithGames) as { [key: string]: IAllGames };

  return {
    "Most Kills": {
      value: gameWithRecordKills.kills,
      hero: gameWithRecordKills.hero,
      matchUrl: gameWithRecordKills.matchUrl,
      result: gameWithRecordKills.result,
    },
    "Most Deaths": {
      value: gameWithRecordDeaths.deaths,
      hero: gameWithRecordDeaths.hero,
      matchUrl: gameWithRecordDeaths.matchUrl,
      result: gameWithRecordDeaths.result,
    },
    "Most Assists": {
      value: gameWithRecordAssists.assists,
      hero: gameWithRecordAssists.hero,
      matchUrl: gameWithRecordAssists.matchUrl,
      result: gameWithRecordAssists.result,
    },
    "Longest Match": {
      // todo: value считается не совсем правильно
      value: `${(gameWithRecordDuration.duration / 60).toFixed(0)}+ minutes`,
      hero: gameWithRecordDuration.hero,
      matchUrl: gameWithRecordDuration.matchUrl,
      result: gameWithRecordDuration.result,
    },
  };
}
