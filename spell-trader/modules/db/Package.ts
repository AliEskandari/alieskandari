import { Order } from "@/types/App/Order";
import { db } from "../firebase/client";
import { manager } from "./functions/manager";

export const Package = manager<Order.Package>({
  db,
  collectionId: "packages",
  _default: {
    id: "",
    seller: {
      id: "",
    },
    items: [],
    total: 0,
    itemTotal: 0,
    shippingTotal: 0,
    createdAt: "",
    updatedAt: "",
    buyer: {
      id: "",
      shippingDetails: null,
    },
    status: "pending",
    order: {
      id: "",
    },
    tracking: {
      number: "",
    },
    feedback: {
      id: "",
    },
  },
});
