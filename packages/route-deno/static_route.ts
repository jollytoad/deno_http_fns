import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { serveDir } from "./_serve_dir.ts";
import { fromFileUrl } from "@std/path/from-file-url";
import type { Awaitable, StaticRouteOptions } from "./types.ts";

export type { StaticRouteOptions };

/**
 * Create a Request handler that serves static files under a matched URL pattern.
 *
 * @example
 * ```ts
 * Deno.serve(
 *   withFallback(
 *      staticRoute("/", import.meta.resolve("./public")),
 *   )
 * );
 * ```
 *
 * @param pattern the URL pattern to match
 * @param fileRootUrl the root from where the files are served (this should be a file:// URL)
 * @returns a Request handler that always returns a Response
 */
export function staticRoute(
  pattern: string,
  fileRootUrl: string,
  options?: StaticRouteOptions,
): (request: Request) => Awaitable<Response | null> {
  const fsRoot = fromFileUrl(fileRootUrl);

  pattern = pattern.replace(/\/$/, "");

  return byPattern(
    [`${pattern}/`, `${pattern}/:path+`],
    byMethod({
      GET(req, info) {
        const urlRoot = info.pathname.input.slice(
          1,
          -(info.pathname.groups.path?.length ?? 0),
        );
        return serveDir(req, { ...options, fsRoot, urlRoot });
      },
    }),
  );
}
