import { ApiResponse } from "@/pages/api/weaviate/search";
import client from "../client";
import { SearchArgs } from "@/modules/weaviate/search";

export async function search({ className, imageUrl }: SearchArgs) {
  const config = {
    method: "POST",
    url: "/api/weaviate/search",
    data: {
      className,
      imageUrl,
    },
  };
  const resp = await client.request<ApiResponse>(config);
  return resp.data.documents ?? [];
}
