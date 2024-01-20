/*
 * Game mods, matches from which will be taken into account when calculating the player's records.
 * Key for dotaBuff, value for openDota.
 */
export enum gameModes {
  all_pick = 1, // old allPick
  captains_mode = 2,
  random_draft = 3,
  single_draft = 4,
  all_random = 5,
  captains_draft = 16,
  all_draft = 22, // actual allPick
  turbo = 23,
}
