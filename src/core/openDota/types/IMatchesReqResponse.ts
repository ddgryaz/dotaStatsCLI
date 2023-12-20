export interface IMatchesReqResponse {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  item_0: number;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  matchUrl: string;
  duration: number; // in seconds
}
