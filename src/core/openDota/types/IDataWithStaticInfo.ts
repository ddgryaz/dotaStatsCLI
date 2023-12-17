interface IData {
  id: number;
  localized_name: string;
  dname: string;
  img: string;
}
export interface IDataWithStaticInfo {
  [key: string]: IData;
}
