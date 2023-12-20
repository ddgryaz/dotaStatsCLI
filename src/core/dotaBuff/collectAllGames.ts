import { IAllGames } from "./types/IAllGames";
import { IAllArray } from "./types/IAllArray";

function calcDuration(durationRaw: string): number {
  const [minutes, seconds] = durationRaw.split(":");
  return Number(minutes) * 60 + Number(seconds);
}

export function collectAllGames(document: Document): IAllGames[] {
  return Array.from(document.querySelectorAll("table tbody tr")).map(
    (gameRow) => {
      const KDA = Array.from(
        gameRow.querySelectorAll("span.kda-record span.value"),
      ).map((el) => {
        return el?.textContent?.trim() || "";
      });

      const [kills, deaths, assists]: string[] = KDA;

      const matchUrl: string = "https://www.dotabuff.com".concat(
        gameRow
          .querySelector("td.cell-centered.r-none-mobile + td a")
          ?.getAttribute("href") || "",
      );

      const durationRaw: string =
        gameRow
          .querySelector("td.r-none-mobile:not(.cell-centered) + td")
          ?.textContent?.trim() || "";

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
        kills: Number(kills),
        deaths: Number(deaths),
        assists: Number(assists),
        matchUrl,
        duration: calcDuration(durationRaw),
      };
    },
  );
}
