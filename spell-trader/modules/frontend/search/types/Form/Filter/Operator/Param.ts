import Search from "@/modules/frontend/search/types";
import { Operator } from "@/modules/frontend/search/types/Operator";

export interface Param extends Search.Form.Filter.Param {
  key: Search.Form.Filter.Key;
  value: string;
  operator: Operator;
}
