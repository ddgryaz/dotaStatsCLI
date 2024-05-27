import isOnline from "is-online";
import { NoNetworkError } from "../errors/noNetworkError.js";

export async function checkNetworkConnection(): Promise<void> {
  const isConnection: boolean = await isOnline();

  if (!isConnection)
    throw new NoNetworkError(
      "Error: Hello! It seems you are having problems connecting to the outside world. Please check your network and try again.",
    );
}
