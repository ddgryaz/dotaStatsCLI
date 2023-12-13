import { IAllGames } from "../types/IAllGames";
import { IAllArray } from "../types/IAllArray";

export function collectAllGames(document: Document): IAllGames[] {
  return Array.from(document.querySelectorAll("table tbody tr")).map(
    (gameRow) => {
      return {
        heroAvatar:
          "https://www.dotabuff.com".concat(
            gameRow
              .querySelector("div[class*='image-container-hero'] img")
              ?.getAttribute("src") || "",
          ) || "",
        hero:
          gameRow.querySelector("td.cell-large a")?.textContent?.trim() || "",
        result:
          gameRow
            .querySelector("td.cell-centered.r-none-mobile + td a")
            ?.textContent?.trim() || "",
        items: Array.from(
          gameRow.querySelectorAll("td.r-none-tablet.cell-xxlarge div a"),
        ).map((link): IAllArray => {
          return {
            name:
              link
                ?.getAttribute("href")
                ?.split("items/")?.[1]
                ?.replaceAll("-", " ")
                ?.trim()
                ?.split(/\s+/)
                ?.map((word) => word[0].toUpperCase() + word.substring(1))
                ?.join(" ") || "",
            avatar: "https://www.dotabuff.com".concat(
              link.querySelector("img")?.getAttribute("src") || "",
            ),
          };
        }),
      };
    },
  );
}
