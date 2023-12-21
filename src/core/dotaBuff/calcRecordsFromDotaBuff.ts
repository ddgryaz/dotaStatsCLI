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
    recordKills: {
      value: gameWithRecordKills.kills,
      hero: gameWithRecordKills.hero,
      heroAvatar: gameWithRecordKills.heroAvatar,
      matchUrl: gameWithRecordKills.matchUrl,
    },
    recordDeaths: {
      value: gameWithRecordDeaths.deaths,
      hero: gameWithRecordDeaths.hero,
      heroAvatar: gameWithRecordDeaths.heroAvatar,
      matchUrl: gameWithRecordDeaths.matchUrl,
    },
    recordAssists: {
      value: gameWithRecordAssists.assists,
      hero: gameWithRecordAssists.hero,
      heroAvatar: gameWithRecordAssists.heroAvatar,
      matchUrl: gameWithRecordAssists.matchUrl,
    },
    recordDuration: {
      value: gameWithRecordDuration.duration,
      hero: gameWithRecordDuration.hero,
      heroAvatar: gameWithRecordDuration.heroAvatar,
      matchUrl: gameWithRecordDuration.matchUrl,
    },
  };
}
