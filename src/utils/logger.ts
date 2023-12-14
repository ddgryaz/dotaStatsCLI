import Pino from "pino";
import Pretty from "pino-pretty";

export const logger = Pino(
  Pretty({
    colorize: true,
    translateTime: "SYS:standard",
  }),
);
