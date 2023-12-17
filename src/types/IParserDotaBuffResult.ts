import { IPlayerStats } from "../core/dotaBuff/types/IPlayerStats";

export interface IParserDotaBuffResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  TOTAL_TOP: number;
}
