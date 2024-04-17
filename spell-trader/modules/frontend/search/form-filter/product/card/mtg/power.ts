import Search from "@/modules/frontend/search/types";

export const Power: Search.Form.Filter<"power"> = Object.freeze({
  key: "power",
  field: "traits.power",
  label: "Power",
  type: "operator",
});
