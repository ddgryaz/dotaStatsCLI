export interface IAllMatches {
  match_id: number;
  hero_id: number;
  result: string;
  items_ids: number[];
  kills: number;
  assists: number;
  deaths: number;
  duration: number; // in seconds
}
