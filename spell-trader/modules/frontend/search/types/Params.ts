import Search from ".";
import { Sort } from "./Params/Sort";
type FilterParamMap = Partial<
  Record<Search.Form.Filter.Key, Search.Form.Filter.Param>
>;

export type Params = {
  q?: string;
  query_by?: string[];
  per_page?: number;
  filters?: FilterParamMap;
  sort?: Sort;
};
