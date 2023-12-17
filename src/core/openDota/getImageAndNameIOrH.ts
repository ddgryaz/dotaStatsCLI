import { BaseError } from "../../errors/baseError";
import { IDataWithStaticInfo } from "./types/IDataWithStaticInfo";

const steamHostForImage = "https://cdn.dota2.com/";
export async function getImageAndNameIOrH(
  endpoint: string,
  id: number,
): Promise<{ name: string; avatar: string }> {
  const type = endpoint.split("/").at(-1) as "heroes" | "items";
  const dataWithStaticInfo = await fetch(endpoint, { method: "GET" }).then(
    async (
      response,
    ): Promise<{
      json: IDataWithStaticInfo;
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

  const { json, status, success } = dataWithStaticInfo;

  if ("error" in json && !success) {
    throw new BaseError(`Error: ${json.error}. Status code: ${status}.`);
  }

  switch (type) {
    case "heroes":
      if (json[`${id}`]) {
        const { localized_name, img } = json[`${id}`];
        return {
          name: localized_name,
          avatar: steamHostForImage.concat(img),
        };
      } else {
        return {
          name: "no data",
          avatar: "no data",
        };
      }
    case "items":
      const item = Object.values(json)
        .filter((item) => item.id === id)
        .shift();

      if (item) {
        return {
          name: item.dname,
          avatar: steamHostForImage.concat(item.img),
        };
      } else {
        return {
          name: "no data",
          avatar: "no data",
        };
      }
  }
}
