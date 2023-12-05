import { IMostPopular } from "./IMostPopular";

export interface IPlayerStats {
  totalGames: number;
  win: number;
  lose: number;
  overallWinRate: string;
  mostPopularHeroes: IMostPopular[];
  mostPopularItems: IMostPopular[];
}
