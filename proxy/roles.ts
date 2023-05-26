import { getProviderFn } from "./_provider.ts";
import { subValues } from "./_substitute.ts";
import type { Manifest, Role } from "./types.ts";

export async function getRoles(
  req: Request,
  manifest: Manifest,
  wildcard = true,
): Promise<Role[]> {
  const providerFn = await getProviderFn(manifest.rolesProvider);

  const params = manifest.rolesProvider?.params
    ? subValues(manifest.rolesProvider.params)
    : undefined;
  const roles = await providerFn?.(req, params) ?? [];

  return wildcard ? ["*", ...roles] : roles;
}
