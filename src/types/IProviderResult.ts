import { IPlayerStats } from "../core/dotaBuff/types/IPlayerStats";
import { IRecords } from "./IRecords";

export interface IProviderResult {
  playerName: string;
  avatarUrl: string;
  playerStats: IPlayerStats;
  TOTAL_TOP_HEROES: number;
  TOTAL_TOP_ITEMS: number;
  records: IRecords;
}
