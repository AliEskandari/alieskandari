import type Search from "../..";
import { Operator } from "../../Operator";

export interface Param {
  key: Search.Form.Filter.Key;
  value: string | string[];
}
