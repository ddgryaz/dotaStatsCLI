import { IMatchesReqResponse } from "./types/IMatchesReqResponse";
import { BaseError } from "../../errors/baseError";

export async function getMatches(
  id: number,
  gamesCount: number,
  endpoint: string,
) {
  // todo: необходимо фильтровать game_mode еще на этапе запроса
  const dataWithMatchesInfo = await fetch(
    endpoint
      .replace("REQUIRED_ID", id.toString())
      .replace("GAMES_COUNT", gamesCount.toString()),
    { method: "GET" },
  ).then(
    async (
      response,
    ): Promise<{
      json: IMatchesReqResponse[];
      status: number;
      success: boolean;
    }> => {
      return {
        json: await response.json(),
        status: response.status,
        success: response.status === 200,
      };
    },
  );

  const { json, status, success } = dataWithMatchesInfo;

  console.log(json.length);

  if ("error" in json && !success) {
    throw new BaseError(`Error: ${json.error}. Status code: ${status}.`);
  }

  enum importantModes {
    allPick = 1, // old allPick
    captainsMode = 2,
    randomDraft = 3,
    singleDraft = 4,
    allRandom = 5,
    allDraft = 22, // actual allPick
    turbo = 23,
  }

  function calcResultMatch(sideNumber: number, radiantWin: boolean) {
    const side = sideNumber >= 128 ? "dire" : "radiant";

    switch (radiantWin) {
      case true:
        if (side === "radiant") {
          return "Won Match";
        } else {
          return "Lose Match";
        }
      case false:
        if (side === "radiant") {
          return "Lose Match";
        } else {
          return "Won Match";
        }
    }
  }

  return json
    .filter((match) => {
      if (match.game_mode in importantModes) return match;
    })
    .map((match) => {
      return {
        match_id: match.match_id,
        hero_id: match.hero_id,
        result: calcResultMatch(match.player_slot, match.radiant_win),
        items_ids: [
          match.item_0,
          match.item_1,
          match.item_2,
          match.item_3,
          match.item_4,
          match.item_5,
        ],
      };
    });
}
