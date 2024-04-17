import type Search from "@/modules/frontend/search/types";

export const Cmc: Search.Form.Filter<"cmc"> = Object.freeze({
  key: "cmc",
  field: "traits.cmc",
  label: "Mana",
  type: "operator",
});
