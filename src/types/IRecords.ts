export interface IRecord {
  value: string | number;
  hero: string;
  matchUrl: string;
  result: string;
}

export interface IRecords {
  "Most Kills": IRecord;
  "Most Deaths": IRecord;
  "Most Assists": IRecord;
  "Longest Match": IRecord;
}
