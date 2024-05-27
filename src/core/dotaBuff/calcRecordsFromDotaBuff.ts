import { IAllGames } from "./types/IAllGames.js";
import { IRecords } from "../../types/IRecords.js";
import { getRecords } from "../getRecords.js";
import { getTimeFromSeconds } from "../../utils/getTimeFromSeconds.js";
import { gameModes } from "../../constants/gameModes.js";
import { MIN_DURATION } from "../../constants/minDuration.js";

export function calcRecordsFromDotaBuff(arrayWithGames: IAllGames[]): IRecords {
  const {
    gameWithRecordKills,
    gameWithRecordDeaths,
    gameWithRecordAssists,
    gameWithRecordDuration,
  } = getRecords(
    arrayWithGames.filter((game) => {
      if (game.game_mode in gameModes && game.duration > MIN_DURATION) {
        return game;
      }
    }),
  ) as { [key: string]: IAllGames };

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
      value: getTimeFromSeconds(gameWithRecordDuration.duration),
      hero: gameWithRecordDuration.hero,
      matchUrl: gameWithRecordDuration.matchUrl,
      result: gameWithRecordDuration.result,
    },
  };
}
