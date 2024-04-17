import { Cart } from "@/types/App/Cart";
import { Collection } from "@/types/App/Collection";
import Notification from "@/types/App/Notification";
import { Order } from "@/types/App/Order";
import { User as UserType } from "@/types/App/User";
import { db } from "../firebase/client";
import { manager } from "./functions/manager";

const userManager = manager<UserType>({
  db,
  collectionId: "users",
  _default: {
    id: "",
    email: "",
    createdAt: "",
    updatedAt: "",
    storefront: {
      name: "My Card Haus",
      handle: "",
      sales: {
        count: 0,
      },
      feedback: {
        average: 0,
        count: 0,
      },
      shipping: {
        free: false,
        freeOver: 0,
        flatRate: 0,
      },
    },
    stripe: null,
    settings: {
      warnings: {},
    },
  },
});

export const User = {
  ...userManager,
  collection: manager<Collection.Item>({
    db,
    collectionId: "collection",
    collectionPathFn: (id: string) => `users/${id}/collection`,
  }),
  wishlist: manager<Collection.Item>({
    db,
    collectionId: "wishlist",
    collectionPathFn: (id: string) => `users/${id}/wishlist`,
  }),
  cart: manager<Cart.Item>({
    db,
    collectionId: "cart",
    collectionPathFn: (id: string) => `users/${id}/cart`,
    _default: {
      id: "",
      listing: { id: "" },
      quantity: 0,
      createdAt: "",
      updatedAt: "",
    },
  }),
  order: manager<Order>({
    db,
    collectionId: "orders",
    collectionPathFn: (id: string) => `users/${id}/orders`,
    _default: {
      id: "",
      user: { id: "" },
      packages: [],
      total: 0,
      itemCount: 0,
      createdAt: "",
      updatedAt: "",
      status: "pending",
    },
  }),
  feedback: manager<UserType.Feedback>({
    db,
    collectionId: "feedback",
    collectionPathFn: (id: string) => `users/${id}/feedback`,
    _default: {
      id: "",
      createdAt: "",
      updatedAt: "",
      rating: 1,
      comment: "",
      author: { id: "" },
      user: { id: "" },
      package: { id: "" },
    },
  }),
  notification: manager<Notification>({
    db,
    collectionId: "notifications",
    collectionPathFn: (id: string) => `users/${id}/notifications`,
    _default: {
      id: "",
      createdAt: "",
      updatedAt: "",
      title: "",
      details: "",
      group: "app",
      category: "info",
      type: "APP_MESSAGE",
      link: "",
    },
  }),
};
