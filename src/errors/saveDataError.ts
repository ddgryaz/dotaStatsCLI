import { BaseError } from "./baseError";
import { IProviderResult } from "../types/IProviderResult";

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
