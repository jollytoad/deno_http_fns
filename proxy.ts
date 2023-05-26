import { byPattern } from "./pattern.ts";
import { proxyViaRules } from "./proxy/via_rules.ts";
import { getRoles } from "./proxy/roles.ts";
import type { Manifest } from "./proxy/types.ts";

/**
 * Create a proxy route that forwards requests according to the rules of the given manifest.
 */
export function proxyRoute(pattern: string, manifest: Manifest) {
  return byPattern(
    `${pattern === "/" ? "" : pattern}/:path*`,
    async function (req, info) {
      const roles = await getRoles(req, manifest);

      const incomingUrl = new URL(req.url);

      // map the req url to the target url from the manifest
      const outgoingUrl = new URL(
        `${manifest.target}/${info.pathname.groups.path ?? ""}`,
      );
      outgoingUrl.search = incomingUrl.search;

      // proxy the request according to the rules in the manifest and the roles of the incoming request
      return proxyViaRules(
        new Request(outgoingUrl, req),
        manifest.routeRules ?? [],
        roles,
      );
    },
  );
}
