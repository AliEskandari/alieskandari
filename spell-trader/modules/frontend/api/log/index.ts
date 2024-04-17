import client from "../client";

const log = async (message: string) => {
  const resp = await client.request<{}>({
    url: "/api/log",
    method: "POST",
    data: { message },
  });

  return resp.data;
};
export default log;
