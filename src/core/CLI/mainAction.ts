import { Config } from "../config.js";
import inquirer from "inquirer";
import { newPlayer } from "./newPlayer.js";
import { savedPlayers } from "./savedPlayers.js";
import { IMainAction } from "./types/IMainAction.js";
import { IAction } from "./types/IAction.js";

export async function mainAction(): Promise<IMainAction> {
  const CONFIG = Config.getInstance().config;

  const actions: IAction[] = [
    {
      name: "New player",
      value: newPlayer,
    },
    {
      name: "Saved players",
      value: savedPlayers,
      disabled: !CONFIG.players?.length,
    },
  ];

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `Choose an action:`,
      choices: actions,
    },
  ]);

  const selectedAction: IAction = actions.find(
    (el: IAction) => el.value === action,
  ) as IAction;

  const { name }: { name: string } = selectedAction;

  return {
    action,
    name,
  };
}
