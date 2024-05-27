import { ICheckForUpdates } from "../types/ICheckForUpdates.js";
import { logger } from "./logger.js";

const NPM_API_ENDPOINT: string =
  "https://registry.npmjs.org/dotastatscli/latest";
export async function checkForUpdates(
  currentVersion: string,
): Promise<ICheckForUpdates> {
  const latestPackageInfo = await fetch(NPM_API_ENDPOINT, {
    method: "GET",
  }).then(
    async (
      response,
    ): Promise<{
      json: { version: string };
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

  const { json, status, success } = latestPackageInfo;

  if ("error" in json || !success) {
    logger.warn(
      `Warning: Failed to obtain information about the latest version of the application. Status code: ${status}\n`,
    );
    return {
      actualVersion: null,
      updateNotification: null,
    };
  }

  const { version } = json;

  if (currentVersion === version) {
    return {
      actualVersion: true,
      updateNotification: `You are using the actual version of the application.`,
    };
  } else {
    return {
      actualVersion: false,
      updateNotification: `New version available - ${version}. To update use: npm update -g dotastatscli`,
    };
  }
}
