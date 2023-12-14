export class BaseError extends Error {
  constructor(readonly message: string) {
    super(message);
  }
}
