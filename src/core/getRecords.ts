import { IAllGames } from "./dotaBuff/types/IAllGames";
import { IAllMatches } from "./openDota/types/IAllMatches";

export function getRecords(arrayWithGames: IAllGames[] | IAllMatches[]) {
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
    gameWithRecordKills,
    gameWithRecordDeaths,
    gameWithRecordAssists,
    gameWithRecordDuration,
  };
}
