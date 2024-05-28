import inquirer from "inquirer";
import { Validator } from "../../utils/validator.js";
import { Config } from "../config.js";

export async function savedPlayers() {
  const CONFIG = Config.getInstance().config;

  const { playerId, matchesCount } = await inquirer.prompt([
    {
      type: "list",
      name: "playerId",
      message: "Select a player from the list:",
      choices: CONFIG.players?.map((player) => {
        return { name: player.playerName, value: player.id };
      }),
    },
    {
      type: "input",
      name: "matchesCount",
      message: "Enter number of matches:",
      default: 100,
      validate: Validator.inputMatchCountValidator,
    },
  ]);

  return { playerId, matchesCount };
}
