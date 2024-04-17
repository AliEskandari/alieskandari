import client from "@/modules/frontend/api/client";
import { ApiResponse, ReqBody } from "@/pages/api/stripe/checkout/session/new";
import { User } from "@/types/App/User";
import { AxiosRequestConfig } from "axios";

export const _new = async function (
  userId: ReqBody["userId"],
  user: User | null | undefined,
  packagesMap: ReqBody["packagesMap"],
  listingsMap: ReqBody["listingsMap"],
  sellersMap: ReqBody["sellersMap"]
) {
  const config: AxiosRequestConfig<ReqBody> = {
    method: "POST",
    url: "/api/stripe/checkout/session/new",
    data: {
      userId,
      user,
      packagesMap,
      listingsMap,
      sellersMap,
    },
  };
  const resp = await client.request<ApiResponse>(config);
  return resp.data?.url ?? null;
};
