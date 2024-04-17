import Search from "@/modules/frontend/search/types";
import { Filter } from "@/modules/frontend/search/types/Form/Filter";

export const Toughness: Search.Form.Filter<"toughness"> = Object.freeze({
  key: "toughness",
  field: "traits.toughness",
  label: "Toughness",
  type: "operator",
});
