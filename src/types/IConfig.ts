interface IPlayersConfig {
  playerName: string;
  id: number;
}

export interface IConfig {
  players?: IPlayersConfig[];
}
