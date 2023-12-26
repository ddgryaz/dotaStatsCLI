import { IAllArray } from "../core/dotaBuff/types/IAllArray";

export function sortByPopularity(array: IAllArray[]): IAllArray[] {
  const countHeroMatches = Object.create(null);

  for (let i = 0; i < array.length; ++i) {
    countHeroMatches[array[i].name] = ~~countHeroMatches[array[i].name] + 1;
  }

  return array.sort(function (x, y) {
    return (
      countHeroMatches[y.name] - countHeroMatches[x.name] ||
      x.name.localeCompare(y.name)
    );
  });
  // if (typeof array[0] !== "number") {
  //
  // } else {
  // todo: или здесь баг, я хз
  // return array
  //   .sort((a, b) => {
  //     return (a as number) - (b as number);
  //   })
  //   .sort(
  //     (a, b) =>
  //       array.filter((v): boolean => v === a).length -
  //       array.filter((v): boolean => v === b).length,
  //   )
  //   .reverse();
  // }
}
