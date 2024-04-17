import Search from "@/modules/frontend/search/types";
import { Filter } from "@/modules/frontend/search/types/Form/Filter";

export const Loyalty: Search.Form.Filter<"loyalty"> = Object.freeze({
  key: "loyalty",
  field: "traits.loyalty",
  label: "Loyalty",
  type: "operator",
});
