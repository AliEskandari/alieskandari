import type Search from "@/modules/frontend/search/types";
export const SetName: Search.Form.Filter<"set-name"> = Object.freeze({
  key: "set-name",
  field: "traits.set_name",
  label: "Set name",
  type: "text",
});
