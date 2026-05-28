/** @format */

export interface ENV {
  apiEndPoint: string;
  apiDomainMap: string;
  serverApiEndPoint: string;
  pageTitle: string;
  tokenKey: string;
  token: string;
  timeout: string;
  frontendUrl: string;
}

const env: ENV = {
  apiEndPoint: process.env.NEXT_PUBLIC_API_END_POINT || "",
  apiDomainMap: process.env.NEXT_PUBLIC_API_DOMAIN_MAP || "",
  serverApiEndPoint: process.env.NEXT_PUBLIC_API_END_POINT || "",
  pageTitle: process.env.VITE_PAGE_TITLE || "",
  tokenKey: process.env.NEXT_PUBLIC_API_TOKEN_KEY || "",
  token: process.env.VITE_TOKEN || "",
  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT || "",
  frontendUrl: process.env.VITE_FRONTEND_URL || "",
};

export default env;
