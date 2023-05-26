import { subEnvVars } from "./_substitute.ts";
import type { Provider, ProviderFn } from "./types.ts";

export async function getProviderFn<R>(
  provider?: Provider<R>,
): Promise<ProviderFn<R> | undefined> {
  if (provider?.as !== undefined) {
    return () => provider.as;
  } else if (typeof provider?.fn === "function") {
    return provider.fn;
  } else {
    const moduleRef = subRef(provider?.module);
    const serviceRef = subRef(provider?.service);

    if (moduleRef) {
      const module = await import(`${moduleRef}`);
      if (typeof module.default === "function") {
        return module.default;
      }
    } else if (serviceRef) {
      return fetchProvider<R>(serviceRef);
    }
  }
}

function subRef(ref: string | URL | undefined) {
  if (typeof ref === "string") {
    return subEnvVars(ref);
  } else if (ref instanceof URL) {
    return ref;
  }
}

function fetchProvider<R>(url: string | URL): ProviderFn<R> {
  return async (req, params): Promise<R | undefined> => {
    const headers = new Headers(req.headers);

    headers.set("Original-Method", req.method);
    headers.set("Original-URL", req.url);
    headers.set("Accept-Content-Type", "application/json");

    let urlWithParams: string | URL = url;

    const paramEntries = Object.entries(params ?? {});

    if (paramEntries.length) {
      urlWithParams = new URL(url);

      for (const [key, value] of paramEntries) {
        urlWithParams.searchParams.set(key, value);
      }
    }

    const response = await fetch(urlWithParams, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      return await response.json() as R;
    }
  };
}
