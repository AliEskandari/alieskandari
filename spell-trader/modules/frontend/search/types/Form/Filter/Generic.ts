import { MtgCard } from "@/types/App/Product/Card/MtgCard";
import { DotNotation } from "@/types/utilities";
import Search from "../..";

export type Generic<Key = Search.Form.Filter.Key> = {
  key: Key; // use in findById (kebab-case)
  field: DotNotation<MtgCard>; // used to query typesense
  label: string; // used to display in UI
  type: "operator" | "select" | "text";
};
