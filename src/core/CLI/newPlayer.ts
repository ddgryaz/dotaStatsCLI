import inquirer from "inquirer";
import { Validator } from "../../utils/validator.js";

export async function newPlayer() {
  const { playerId, matchesCount } = await inquirer.prompt([
    {
      type: "input",
      name: "playerId",
      message: "Enter Player ID:",
      validate: Validator.inputPlayerIdValidator,
    },
    {
      type: "input",
      name: "matchesCount",
      message: "Enter number of matches:",
      default: "100",
      validate: Validator.inputMatchCountValidator,
    },
  ]);

  return { playerId, matchesCount };
}
