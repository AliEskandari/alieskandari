import client from "@/modules/frontend/api/client";
import { ApiResponse, ReqBody } from "@/pages/api/stripe/account-links/create";
import { AxiosRequestConfig } from "axios";

export const create = async function (stripeAccountId: string) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/stripe/account-links/create",
    data: {
      stripeAccountId,
    },
  };
  const resp = await client.request<ApiResponse>(config);
  return resp.data?.url ?? null;
};
