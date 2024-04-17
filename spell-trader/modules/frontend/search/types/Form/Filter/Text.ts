import Search from "../..";
import { Generic } from "./Generic";

export type Text<Key = Search.Form.Filter.Key> = Generic<Key> & {
  type: "text";
};
