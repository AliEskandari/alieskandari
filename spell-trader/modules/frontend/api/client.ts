import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class Client {
  axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      headers: {
        "Content-Language": "en-US",
        "Content-Type": "application/json",
      },
    });
  }

  request<T, D = any>(config: AxiosRequestConfig<D>) {
    return this.axios.request<T, AxiosResponse<T>, D>(config);
  }
}

const client = new Client();

export default client;
