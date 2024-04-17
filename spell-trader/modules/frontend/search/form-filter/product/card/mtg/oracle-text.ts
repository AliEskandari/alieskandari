import type Search from "@/modules/frontend/search/types";

export const OracleText: Search.Form.Filter<"oracle-text"> = Object.freeze({
  key: "oracle-text",
  name: "oracleText",
  field: "traits.oracle_text",
  label: "Oracle text",
  type: "text",
});
