import { Product as ProductType } from "@/types/App/Product";
import { db } from "../firebase/client";
import { manager } from "./functions/manager";

export const Product = manager<ProductType>({
  db,
  collectionId: "products",
  _default: {
    id: "",
    createdAt: "",
    updatedAt: "",
    title: "",
    details: "",
    photos: { ids: [], entities: {} },
    type: "card",
    line: "magic-the-gathering",
    language: "english",
  },
});
