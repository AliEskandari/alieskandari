import { Listing as ListingType } from "@/types/App/Listing";
import { db } from "../firebase/client";
import { manager } from "./functions/manager";

export const Listing = manager<ListingType>({
  db,
  collectionId: "listings",
  _default: {
    id: "",
    for: "deck",
    user: {
      id: "",
      storefront: {
        name: "",
        handle: "",
        sales: { count: 0 },
        feedback: { average: 0, count: 0 },
      },
      stripe: { id: "" },
    },
    title: "",
    status: "new",
    photos: { ids: [], entities: {} },
    condition: { id: "1000" },
    quantity: 1,
    price: 0.0,
    advanced: {
      itemSku: "",
      shipping: {
        dimensions: {
          height: 0,
          length: 0,
          weight: 0,
          width: 0,
        },
        cost: 0.0,
      },
    },
    createdAt: "",
    updatedAt: "",
  },
});
