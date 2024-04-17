import { AxiosRequestConfig } from "axios";
import client from "../client";
import { ApiResponse, ReqBody } from "@/pages/api/users/delete";

export async function _delete(userId: string) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/users/delete",
    data: { userId },
  };

  const resp = await client.request<ApiResponse>(config);
  return resp.data;
}
