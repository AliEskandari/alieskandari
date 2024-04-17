import Search from "@/modules/frontend/search/types";
import { Filter } from "@/modules/frontend/search/types/Form/Filter";

export const TypeLine: Search.Form.Filter<"type-line"> = Object.freeze({
  key: "type-line",
  field: "traits.type_line",
  label: "Card type",
  type: "text",
});
