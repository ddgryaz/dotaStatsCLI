export function sortByPopularity(array: string[]): string[] {
  return array
    .sort(
      (a: string, b: string) =>
        array.filter((v: string): boolean => v === a).length -
        array.filter((v: string): boolean => v === b).length,
    )
    .reverse();
}
