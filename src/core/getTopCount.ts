function ceil50(number: number): number {
  return Math.ceil(number / 50) * 50;
}

export function getTopCount(gamesCount: number): number {
  if (ceil50(gamesCount) >= 200) return 10;
  return 5;
}
