import { IAllArray } from "../types/IAllArray";

export function sortByPopularity(array: IAllArray[]): IAllArray[] {
  return array
    .sort(
      (a: IAllArray, b: IAllArray) =>
        array.filter((v: IAllArray): boolean => v.name === a.name).length -
        array.filter((v: IAllArray): boolean => v.name === b.name).length,
    )
    .reverse();
}
