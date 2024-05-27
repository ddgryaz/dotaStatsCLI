export interface IAction {
  name: string;
  value: () => Promise<{ playerId: string; matchesCount: string }>;
  disabled?: boolean;
}
