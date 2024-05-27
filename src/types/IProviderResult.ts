import { IPlayerStats } from "../core/dotaBuff/types/IPlayerStats.js";
import { IRecords } from "./IRecords.js";

export interface IProviderResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  TOTAL_TOP_HEROES: number;
  TOTAL_TOP_ITEMS: number;
  records: IRecords;
}
