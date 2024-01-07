export class Validator {
  static inputPlayerNameValidator(input: string): boolean | string {
    if (/^[a-zA-Z0-9]+$/.test(input) && input.length <= 20) {
      return true;
    } else {
      return "Only Latin letters or numbers. No more than 20 characters.";
    }
  }

  static inputMatchCountValidator(input: string): boolean | string {
    if (/^\d+$/.test(input) && Number(input) > 0) {
      return true;
    } else {
      return "The value can only be a positive integer.";
    }
  }
}
