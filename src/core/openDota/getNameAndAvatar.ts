import { IPlayerReqResponse } from "./types/IPlayerReqResponse";
import { BaseError } from "../../errors/baseError";
import { ImpossibleGetDataError } from "../../errors/impossibleGetDataError";

export async function getNameAndAvatar(
  id: number,
  endpoint: string,
): Promise<{ playerName: string; avatarUrl: string }> {
  const dataWithPlayerInfo = await fetch(
    endpoint.replace("REQUIRED_ID", id.toString()),
    {
      method: "GET",
    },
  ).then(
    async (
      response,
    ): Promise<{
      json: IPlayerReqResponse;
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

  const { json, status, success } = dataWithPlayerInfo;

  if ("error" in json && !success) {
    throw new BaseError(`Error: ${json.error}. Status code: ${status}.`);
  }

  if (!("profile" in json)) {
    throw new ImpossibleGetDataError(
      "Error: Player profile is private or does not exist.",
    );
  }

  const {
    profile: { personaname, avatarfull },
  }: { profile: { personaname: string; avatarfull: string } } = json;

  return {
    playerName: personaname,
    avatarUrl: avatarfull,
  };
}
