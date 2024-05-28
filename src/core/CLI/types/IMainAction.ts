export interface IMainAction {
  name: string;
  action: () => Promise<{ playerId: string; matchesCount: string }>;
}
