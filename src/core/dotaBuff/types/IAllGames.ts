import { IAllArray } from "./IAllArray.js";

export interface IAllGames {
  hero: string;
  heroAvatar: string;
  result: string;
  items: IAllArray[];
  kills: number;
  deaths: number;
  assists: number;
  matchUrl: string;
  duration: number; // in seconds
  game_mode: string;
}
