import { IAllArray } from "./types/IAllArray";

export function sortByPopularityObjects(array: IAllArray[]): IAllArray[] {
  const countHeroMatches = Object.create(null);

  for (let i: number = 0; i < array.length; ++i) {
    countHeroMatches[array[i].name] = ~~countHeroMatches[array[i].name] + 1;
  }

  return array.sort(function (x: IAllArray, y: IAllArray) {
    return (
      countHeroMatches[y.name] - countHeroMatches[x.name] ||
      x.name.localeCompare(y.name)
    );
  });
}
