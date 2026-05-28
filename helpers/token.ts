import env from "@/configs/env";
import { JWT } from "@/models/types";
import moment from "moment";

let TOKEN = "";
export const TOKEN_KEY = env.tokenKey || "okwin_auth";

export interface AuthLocalData {
  token: string;
  expiresAt: number;
  user?: unknown;
}

export const setAuthData = (token: string, user?: unknown) => {
  try {
    const authData: AuthLocalData = {
      token,
      user,
      expiresAt: moment().add(1, "day").unix(),
    };
    TOKEN = token;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(authData));
    window.dispatchEvent(new Event("auth:changed"));
  } catch {}
};

export const clearAuthData = () => {
  try {
    TOKEN = "";
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("auth:changed"));
  } catch {}
};

export const getAuthLocalData = () => {
  try {
    const localData = localStorage.getItem(TOKEN_KEY);
    if (!localData) return null;

    const authData = JSON.parse(localData) as AuthLocalData;
    return authData;
  } catch {
    return null;
  }
};

export const getToken = () => {
  return TOKEN;
};

export const parseTokenString = (str: string) => {
  const authObject: JWT = JSON.parse(str);
  return authObject;
};

export const tokenChecker = (authData: AuthLocalData | null) => {
  if (!authData || !authData.token || authData.expiresAt < moment().unix())
    return false;
  return true;
};
