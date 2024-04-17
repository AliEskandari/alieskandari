import { ApiResponse, ReqBody } from "@/pages/api/notifications/add";
import Notification from "@/types/App/Notification";
import client from "../client";
import { AxiosRequestConfig } from "axios";

export async function add(userId: string, notification: Notification) {
  const config: AxiosRequestConfig<ReqBody> = {
    url: "/api/notifications/add",
    method: "POST",
    data: {
      userId,
      notification,
    },
  };
  const response = await client.request<ApiResponse>(config);
  return response.data;
}
