interface IRecord {
  value: number;
  hero: string;
  heroAvatar: string;
  matchUrl: string;
}

export interface IRecords {
  [key: string]: IRecord;
}
