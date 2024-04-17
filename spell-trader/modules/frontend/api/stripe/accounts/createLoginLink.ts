import client from "@/modules/frontend/api/client";
import {
  ApiResponse,
  ReqBody,
} from "@/pages/api/stripe/accounts/create-login-link";
import { AxiosRequestConfig } from "axios";

export const createLoginLink = async function (
  stripeAccountId: ReqBody["stripeAccountId"]
) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/stripe/accounts/create-login-link",
    data: {
      stripeAccountId,
    },
  };
  const resp = await client.request<ApiResponse>(config);
  return resp.data?.url ?? null;
};
