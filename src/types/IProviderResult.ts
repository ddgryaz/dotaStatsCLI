import { IPlayerStats } from "../core/dotaBuff/types/IPlayerStats";

export interface IProviderResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  TOTAL_TOP: number;
}
