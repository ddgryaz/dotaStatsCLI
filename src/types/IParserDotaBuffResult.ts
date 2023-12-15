import { IPlayerStats } from "./IPlayerStats";

export interface IParserDotaBuffResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  TOTAL_TOP: number;
}
