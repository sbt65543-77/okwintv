import { getServerApiEndPointForHost } from "@/configs/serverEnv";
import { headers as nextHeaders } from "next/headers";

type QueryValue = string | number | boolean | null | undefined;

export type ProxyMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface CallApiProxyOptions {
  endpoint: string;
  method?: ProxyMethod;
  params?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
}

export interface CallApiProxyResult<T> {
  data: T;
  status: number;
  ok: boolean;
}

export interface ProxyRequestBody {
  endpoint?: string;
  method?: ProxyMethod;
  params?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
}

export const isValidProxyEndpoint = (endpoint?: string) =>
  Boolean(endpoint && endpoint.startsWith("/") && !endpoint.startsWith("//"));

const getProxyTimeoutMs = () => {
  const timeout = Number(process.env.API_PROXY_TIMEOUT_MS || 15000);

  return Number.isFinite(timeout) && timeout > 0 ? timeout : 15000;
};

const buildBackendUrl = (
  endpoint: string,
  host: string | null,
  params?: Record<string, QueryValue>,
) => {
  const apiEndPoint = getServerApiEndPointForHost(host);

  if (!apiEndPoint) {
    throw new Error("API_END_POINT or API_DOMAIN_MAP is not configured");
  }

  const url = new URL(endpoint, apiEndPoint);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const callApiProxy = async <T>({
  endpoint,
  method = "GET",
  params,
  body,
  headers,
  cache = "no-store",
}: CallApiProxyOptions): Promise<CallApiProxyResult<T>> => {
  const requestHeaders = await nextHeaders();
  const backendUrl = buildBackendUrl(endpoint, requestHeaders.get("host"), params);
  const response = await fetch(backendUrl, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache,
    signal: AbortSignal.timeout(getProxyTimeoutMs()),
  });

  if (!response.ok) {
    console.error("call-api-proxy backend request failed", {
      endpoint,
      backendUrl: backendUrl.toString(),
      status: response.status,
    });
  }

  return {
    data: (await parseResponseBody(response)) as T,
    status: response.status,
    ok: response.ok,
  };
};
