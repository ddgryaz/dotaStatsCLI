import { BaseError } from "../errors/baseError.js";

export class Validator {
  static inputPlayerNameValidator(input: string): boolean | string {
    if (/^[a-zA-Z0-9]+$/.test(input) && input.length <= 20) {
      return true;
    } else {
      return "Only Latin letters or numbers. No more than 20 characters.";
    }
  }

  static inputPlayerIdValidator(input: string): boolean | string {
    const isOnlyDigits: boolean = /^\d+$/.test(input);
    if (!isOnlyDigits || input.length <= 0) {
      return "Only numbers. Required field";
    } else {
      return true;
    }
  }

  static inputMatchCountValidator(input: string): boolean | string {
    if (/^\d+$/.test(input) && Number(input) > 0) {
      return true;
    } else {
      return "The value can only be a positive integer.";
    }
  }

  static checkArgs(id: string, totalGames: string): void {
    if (
      !(
        /^\d+$/.test(id) &&
        Number(id) > 0 &&
        /^\d+$/.test(totalGames) &&
        Number(totalGames) > 0
      )
    ) {
      throw new BaseError(
        "Error: id and gamesCount are required arguments. Only positive numbers.",
      );
    }
  }
}
