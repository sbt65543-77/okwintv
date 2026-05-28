const normalizeHost = (value?: string | null) =>
  (value || "").split(":")[0]?.trim().toLowerCase();

export const normalizeApiUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const parseApiDomainMap = (value?: string | null) => {
  const source = value?.trim();

  if (!source) {
    return {};
  }

  try {
    const parsed = JSON.parse(source) as Record<string, string>;

    return Object.entries(parsed).reduce<Record<string, string>>(
      (acc, [clientDomain, apiUrl]) => {
        const host = normalizeHost(clientDomain);
        const normalizedApiUrl = normalizeApiUrl(apiUrl);

        if (host && normalizedApiUrl) {
          acc[host] = normalizedApiUrl;
        }

        return acc;
      },
      {},
    );
  } catch {
    return source.split(",").reduce<Record<string, string>>((acc, pair) => {
      const [clientDomain, apiUrl] = pair.split("=");
      const host = normalizeHost(clientDomain);
      const normalizedApiUrl = normalizeApiUrl(apiUrl || "");

      if (host && normalizedApiUrl) {
        acc[host] = normalizedApiUrl;
      }

      return acc;
    }, {});
  }
};

export const getApiEndPointForHost = (
  host: string | null | undefined,
  domainMapValue: string | null | undefined,
  fallbackApiEndPoint: string,
) => {
  const map = parseApiDomainMap(domainMapValue);
  const apiEndPoint = map[normalizeHost(host)] || fallbackApiEndPoint;

  return normalizeApiUrl(apiEndPoint);
};

