import { IHeroesAndItems } from "./types/IHeroesAndItems";
import { IDataWithStaticInfo } from "./types/IDataWithStaticInfo";
import { BaseError } from "../../errors/baseError";

export class HeroesAndItems {
  /*
   * The data at the final endpoints is static.
   * In order not to request data for each hero or item, we implement the singleton pattern.
   */

  private static instance: HeroesAndItems;
  private _heroes: IHeroesAndItems[] | undefined;
  private _items: IHeroesAndItems[] | undefined;
  private readonly _heroesInfoEndpoint: string;
  private readonly _itemsInfoEndpoint: string;
  private readonly _steamHostForImage: string;

  private constructor() {
    this._heroesInfoEndpoint = "https://api.opendota.com/api/constants/heroes";
    this._itemsInfoEndpoint = "https://api.opendota.com/api/constants/items";
    this._steamHostForImage = "https://cdn.dota2.com/";
  }

  public get heroes() {
    return this._heroes;
  }

  public get items() {
    return this._items;
  }

  static async getInstance(): Promise<HeroesAndItems> {
    if (!HeroesAndItems.instance) {
      HeroesAndItems.instance = new HeroesAndItems();
      await HeroesAndItems.instance.initialization();
    }
    return HeroesAndItems.instance;
  }

  private async initialization() {
    this._heroes = await this.getData(this._heroesInfoEndpoint);
    this._items = await this.getData(this._itemsInfoEndpoint);
  }

  private async getData(endpoint: string) {
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
        return Object.values(json).map((hero) => {
          return {
            id: hero.id,
            name: hero.localized_name,
            avatar: this._steamHostForImage.concat(hero.img),
          };
        });
      case "items":
        return Object.values(json).map((item) => {
          return {
            id: item.id,
            name: item.dname
              ?.split(/\s+/)
              ?.map((word) => word[0].toUpperCase() + word.substring(1))
              ?.join(" "),
            avatar: this._steamHostForImage.concat(item.img),
          };
        });
    }
  }
}
