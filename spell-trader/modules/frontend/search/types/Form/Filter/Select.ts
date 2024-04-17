import Search from "../..";
import { Generic } from "./Generic";

export type Select<Key = Search.Form.Filter.Key> = Generic<Key> & {
  type: "select";
  options: string[];
};
