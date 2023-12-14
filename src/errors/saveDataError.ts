import { BaseError } from "./baseError";
import { IParserDotaBuffResult } from "../types/IParserDotaBuffResult";

export class SaveDataError extends BaseError {
  readonly data: IParserDotaBuffResult;
  constructor(
    readonly message: string,
    data: IParserDotaBuffResult,
  ) {
    super(message);
    this.data = data;
  }
}
