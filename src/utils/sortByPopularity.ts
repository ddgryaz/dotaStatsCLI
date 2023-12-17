import { IAllArray } from "../core/dotaBuff/types/IAllArray";

export function sortByPopularity<Type>(array: Type[]): Type[] {
  if (typeof array[0] !== "number") {
    // todo: здесь баг, смотри в result.json 623 str
    return array
      .sort(
        (a, b) =>
          array.filter(
            (v): boolean => (v as IAllArray).name === (a as IAllArray).name,
          ).length -
          array.filter(
            (v): boolean => (v as IAllArray).name === (b as IAllArray).name,
          ).length,
      )
      .reverse();
  } else {
    // todo: или здесь баг, я хз
    return array
      .sort((a, b) => {
        return (a as number) - (b as number);
      })
      .sort(
        (a, b) =>
          array.filter((v): boolean => v === a).length -
          array.filter((v): boolean => v === b).length,
      )
      .reverse();
  }
}
