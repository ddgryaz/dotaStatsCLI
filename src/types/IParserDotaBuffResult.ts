import { IPlayerStats } from "./IPlayerStats";
import { IAllGames } from "./IAllGames";

export interface IParserDotaBuffResult {
  // playerName: string;
  playerStats: IPlayerStats;
  allGames: IAllGames[];
}
