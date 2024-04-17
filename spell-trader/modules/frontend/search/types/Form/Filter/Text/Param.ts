import Search from "@/modules/frontend/search/types";

export interface Param extends Search.Form.Filter.Param {
  key: Search.Form.Filter.Key;
  value: string;
}
