import Search from "..";

export type Filter<Key = Search.Form.Filter.Key> =
  | Search.Form.Filter.Select<Key>
  | Search.Form.Filter.Operator<Key>
  | Search.Form.Filter.Text<Key>;
