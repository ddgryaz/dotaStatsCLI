import { IPlayerStats } from "./IPlayerStats";
import { IAllGames } from "./IAllGames";

export interface IParserDotaBuffResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  // todo: не используется в визуализации? #1
  // allGames: IAllGames[];
}
