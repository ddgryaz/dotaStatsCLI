export function sortByPopularityNumbers(array: number[]): number[] {
  array = array as number[];
  const countHeroIds = Object.create(null);

  for (let i: number = 0; i < array.length; ++i) {
    countHeroIds[array[i]] = ~~countHeroIds[array[i]] + 1;
  }

  return array.sort(function (x: number, y: number) {
    return countHeroIds[y] - countHeroIds[x] || x - y;
  });
}
