export function inputValidator(input: string): boolean | string {
  if (/^\d+$/.test(input) && Number(input) > 0) {
    return true;
  } else {
    return "The value can only be a positive integer.";
  }
}
