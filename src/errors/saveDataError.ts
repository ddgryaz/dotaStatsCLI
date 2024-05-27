import { BaseError } from "./baseError.js";
import { IProviderResult } from "../types/IProviderResult.js";

export class SaveDataError extends BaseError {
  readonly data: IProviderResult;
  constructor(
    readonly message: string,
    data: IProviderResult,
  ) {
    super(message);
    this.data = data;
  }
}
