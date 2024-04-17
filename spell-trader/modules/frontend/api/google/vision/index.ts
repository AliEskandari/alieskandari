import debug from "@/modules/frontend/api/google/debug";
import client from "../../client";
import { ApiResponse } from "@/pages/api/google/vision/web-detect";

const detect = async (urls: string[]) => {
  const resp = await client.request<ApiResponse>({
    method: "POST",
    url: "/api/google/vision/web-detect",
    data: {
      urls,
    },
  });

  debug("Google Vision detected... %O", resp.data);

  return resp.data ?? [];
};
const vision = { detect };
export default vision;
