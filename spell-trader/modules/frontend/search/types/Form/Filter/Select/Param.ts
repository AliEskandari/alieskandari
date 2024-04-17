import Search from "@/modules/frontend/search/types";

export interface Param extends Search.Form.Filter.Param {
  key: Search.Form.Filter.Key;
  value: string[];
  /**
   * How the values should be matched.
   * @example
   * "any" // "any" of the values
   * "contain" // "contain" all of the selected values
   * "exact" // "exact" match of the values
   */
  type: "any" | "contain" | "exact";
}
