import client from "@/modules/frontend/api/client";
import { ApiResponse, ReqBody } from "@/pages/api/stripe/accounts/retrieve";
import { AxiosRequestConfig } from "axios";

export const retrieve = async function (
  stripeAccountId: ReqBody["stripeAccountId"]
) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/stripe/accounts/retrieve",
    data: {
      stripeAccountId,
    },
  };
  const resp = await client.request<ApiResponse>(config);
  return resp.data.account ?? null;
};
