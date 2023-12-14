import { IPlayerStats } from "./IPlayerStats";
import { IAllGames } from "./IAllGames";

export interface IParserDotaBuffResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
}
