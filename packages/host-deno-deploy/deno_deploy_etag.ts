import { eTag } from "@std/http/etag";

/**
 * Get a default ETag for use in Deno deploy with `serveFile`/`serveDir`/`staticRoute`.
 *
 * NOTE: This can still be used in other runtimes and outside Deno Deploy, it'll just return undefined.
 */
export async function denoDeployEtag(): Promise<string | undefined> {
  if (!("Deno" in globalThis)) {
    return undefined;
  }

  const permission = (await Deno.permissions.query?.({
    name: "env",
    variable: "DENO_DEPLOYMENT_ID",
  })).state ?? "granted";

  const denoDeploymentId = permission === "granted"
    ? Deno.env.get("DENO_DEPLOYMENT_ID")
    : undefined;

  return denoDeploymentId ? eTag(denoDeploymentId, { weak: true }) : undefined;
}
