import client from "@/modules/frontend/api/client";
import { ApiResponse } from "@/pages/api/google/cloud/storage/signed-url";

const signedUrl = async (fileName: string, contentType: string) => {
  const resp = await client.request<ApiResponse>({
    method: "POST",
    url: "/api/google/cloud/storage/signed-url",
    data: {
      fileName,
      contentType,
    },
  });

  return resp.data;
};
export default signedUrl;
