import { IMostPopular } from "../core/dotaBuff/types/IMostPopular";

export function finalSortToTables(array: IMostPopular[]): IMostPopular[] {
  return array.sort((a: IMostPopular, b: IMostPopular) => {
    return (
      Number(b.totalGames.split("/")[0]) - Number(a.totalGames.split("/")[0]) ||
      parseFloat(b["winRate%"]) - parseFloat(a["winRate%"])
    );
  });
}
