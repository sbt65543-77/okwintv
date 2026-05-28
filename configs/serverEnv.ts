import "server-only";

import { getApiEndPointForHost } from "./apiDomainMap";

export const getServerApiEndPoint = () =>
  process.env.API_END_POINT?.trim() || "";

export const getServerApiEndPointForHost = (host?: string | null) =>
  getApiEndPointForHost(
    host,
    process.env.API_DOMAIN_MAP,
    process.env.API_END_POINT?.trim() || "",
  );
