import { byPattern } from "./pattern.ts";
import { byMethod } from "./method.ts";
import {
  serveDir,
  ServeDirOptions,
} from "https://deno.land/std@0.193.0/http/file_server.ts";
import { fromFileUrl } from "https://deno.land/std@0.193.0/path/mod.ts";

type StaticRouteOptions = Omit<ServeDirOptions, "fsRoot" | "urlRoot">;

/**
 * Create a Request handler that serves static files under a matched URL pattern.
 *
 * @param pattern the URL pattern to match
 * @param fileRootUrl the root from where the files are served (this should be a file:// URL)
 * @returns a Request handler that always returns a Response
 */
export function staticRoute(
  pattern: string,
  fileRootUrl: string,
  options?: StaticRouteOptions,
) {
  const fsRoot = fromFileUrl(fileRootUrl);

  return byPattern(
    `${pattern === "/" ? "" : pattern}/:path*`,
    byMethod({
      GET(req, info) {
        const urlRoot = info.pathname.input.slice(
          1,
          -info.pathname.groups.path!.length,
        );
        return serveDir(req, { quiet: true, ...options, fsRoot, urlRoot });
      },
    }),
  );
}
