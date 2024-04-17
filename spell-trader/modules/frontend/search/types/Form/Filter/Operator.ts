import Search from "../..";
import { Generic } from "./Generic";

export type Operator<Key = Search.Form.Filter.Key> = Generic<Key> & {
  type: "operator";
};
