import type Search from "@/modules/frontend/search/types";

export const Color: Search.Form.Filter.Select<"color"> = Object.freeze({
  key: "color",
  field: "traits.colors",
  label: "Color",
  type: "select",
  options: ["W", "U", "B", "R", "G"],
});
