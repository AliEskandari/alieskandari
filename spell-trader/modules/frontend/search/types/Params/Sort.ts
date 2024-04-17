import { Product } from "@/types/App/Product";
import { DotNotation } from "@/types/utilities";

export type Sort<T = Product> = {
  by: DotNotation<T>;
  direction: "asc" | "desc";
};
