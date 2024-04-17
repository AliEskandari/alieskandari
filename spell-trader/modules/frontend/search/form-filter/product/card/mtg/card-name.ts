import Search from "@/modules/frontend/search/types";

export const CardName: Search.Form.Filter<"card-name"> = Object.freeze({
  key: "card-name",
  field: "traits.name",
  label: "Name",
  type: "text",
});
