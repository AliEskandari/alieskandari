import { ApiResponse, ReqBody } from "@/pages/api/users/create";
import { AxiosRequestConfig } from "axios";
import client from "../client";

export async function create(user: ReqBody["user"]) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/users/create",
    data: { user },
  };

  const resp = await client.request<ApiResponse>(config);
  return resp.data;
}
