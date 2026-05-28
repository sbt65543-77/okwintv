import env from "@/configs/env";
import { getApiEndPointForHost } from "@/configs/apiDomainMap";
import { clearAuthData, getAuthLocalData } from "@/helpers/token";
import axios from "axios";

const getClientApiEndPoint = () => {
  if (typeof window === "undefined") {
    return env.apiEndPoint;
  }

  return getApiEndPointForHost(
    window.location.hostname,
    env.apiDomainMap,
    env.apiEndPoint,
  );
};

export const Axios = (isAuth = true, baseURL = getClientApiEndPoint()) => {
  const auth = getAuthLocalData();

  const instance = axios.create({
    baseURL: baseURL || "/",
    timeout: Number(env.timeout) || 30000,
    headers: {
      Authorization: isAuth && auth?.token ? `Bearer ${auth.token}` : undefined,
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        isAuth &&
        error?.response?.status === 401 &&
        typeof window !== "undefined"
      ) {
        clearAuthData();

        if (window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};
