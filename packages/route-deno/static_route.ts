import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { serveDir, type ServeDirOptions } from "@std/http/file-server";
import { fromFileUrl } from "@std/path/from-file-url";
import type { Awaitable } from "./types.ts";

/**
 * Options for creating a static route handler.
 */
export type StaticRouteOptions = Omit<ServeDirOptions, "fsRoot" | "urlRoot">;

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
        return serveDir(req, { quiet: true, ...options, fsRoot, urlRoot });
      },
    }),
  );
}
