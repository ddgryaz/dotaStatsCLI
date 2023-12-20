import { IAllGames } from "./dotaBuff/types/IAllGames";
import { IRecords } from "../types/IRecords";

export function getRecords(arrayWithGames: IAllGames[]): IRecords {
  const gameWithRecordKills = arrayWithGames.reduce((acc, curr) =>
    acc.kills > curr.kills ? acc : curr,
  );

  const gameWithRecordDeaths = arrayWithGames.reduce((acc, curr) =>
    acc.deaths > curr.deaths ? acc : curr,
  );

  const gameWithRecordAssists = arrayWithGames.reduce((acc, curr) =>
    acc.assists > curr.assists ? acc : curr,
  );

  const gameWithRecordDuration = arrayWithGames.reduce((acc, curr) =>
    acc.duration > curr.duration ? acc : curr,
  );

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
