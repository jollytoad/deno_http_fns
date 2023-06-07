import { subRef, subValues } from "./_substitute.ts";
import type {
  Manifest,
  Role,
  RolesProvider,
  RolesProviderSpec,
} from "./types.ts";

export async function getRoles(
  req: Request,
  manifest: Manifest,
  wildcard = true,
): Promise<Role[]> {
  const rolesProvider = await getRolesProvider(manifest.rolesProvider);

  const params = manifest.rolesProvider?.params
    ? subValues(manifest.rolesProvider.params)
    : undefined;

  const roles = await rolesProvider?.(req, params) ?? [];

  return wildcard ? ["*", ...roles] : roles;
}

async function getRolesProvider(
  providerSpec?: RolesProviderSpec,
): Promise<RolesProvider | undefined> {
  if (providerSpec?.as !== undefined) {
    return () => providerSpec.as;
  } else if (typeof providerSpec?.fn === "function") {
    return providerSpec.fn;
  } else {
    const moduleRef = subRef(providerSpec?.module);
    const serviceRef = subRef(providerSpec?.service);

    if (moduleRef) {
      const module = await import(`${moduleRef}`);
      if (typeof module.default === "function") {
        return module.default;
      }
    } else if (serviceRef) {
      return fetchRoles(serviceRef);
    }
  }
}

function fetchRoles(url: string | URL): RolesProvider {
  return async (req, params): Promise<Role[] | undefined> => {
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
      return await response.json() as Role[];
    } else {
      console.warn(
        `%cProvider failed: GET ${url} -> ${response.status} ${response.statusText}`,
        "color: red;",
      );
    }
  };
}
