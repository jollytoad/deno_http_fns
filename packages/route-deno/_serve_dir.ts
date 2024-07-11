// Copyright 2024 Mark Gibson. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.

// This has been adapted from jsr:@std/http/file-server (2024-07-10)
import { normalize as posixNormalize } from "@std/path/posix/normalize";
import { join } from "@std/path/join";
import { notFound } from "@http/response/not-found";
import { badRequest } from "@http/response/bad-request";
import { movedPermanently } from "@http/response/moved-permanently";
import { serveFile } from "./_serve_file.ts";
import { stat } from "./_fs.ts";
import type { ServeDirOptions } from "./types.ts";

export type { ServeDirOptions };

/**
 * Serves the files under the given directory root (opts.fsRoot).
 *
 * @example Usage
 * ```ts no-eval
 * import { serveDir } from "@http/route-deno/serve-dir";
 *
 * Deno.serve((req) => {
 *   const pathname = new URL(req.url).pathname;
 *   if (pathname.startsWith("/static")) {
 *     return serveDir(req, {
 *       fsRoot: "path/to/static/files/dir",
 *     });
 *   }
 *   // Do dynamic responses
 *   return new Response();
 * });
 * ```
 *
 * @example Changing the URL root
 *
 * Requests to `/static/path/to/file` will be served from `./public/path/to/file`.
 *
 * ```ts no-eval
 * import { serveDir } from "@http/route-deno/serve-dir";
 *
 * Deno.serve((req) => serveDir(req, {
 *   fsRoot: "public",
 *   urlRoot: "static",
 * }));
 * ```
 *
 * @param req The request to handle
 * @param opts Additional options.
 * @returns A response for the request.
 */
export async function serveDir(
  req: Request,
  opts: ServeDirOptions = {},
): Promise<Response> {
  const target = opts.fsRoot || ".";
  const urlRoot = opts.urlRoot;
  const showIndex = opts.showIndex ?? true;
  const { etagAlgorithm, etagDefault } = opts;

  const url = URL.parse(req.url);
  if (!url) {
    return badRequest();
  }

  const decodedUrl = decodeURIComponent(url.pathname);
  let normalizedPath = posixNormalize(decodedUrl);

  if (urlRoot && !normalizedPath.startsWith("/" + urlRoot)) {
    return notFound();
  }

  // Redirect paths like `/foo////bar` and `/foo/bar/////` to normalized paths.
  if (normalizedPath !== decodedUrl) {
    url.pathname = normalizedPath;
    return movedPermanently(url);
  }

  if (urlRoot) {
    normalizedPath = normalizedPath.replace(urlRoot, "");
  }

  // Remove trailing slashes to avoid ENOENT errors
  // when accessing a path to a file with a trailing slash.
  if (normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  const fsPath = join(target, normalizedPath);
  const fileInfo = await stat(fsPath);

  if (!fileInfo) {
    return notFound();
  }

  // For files, remove the trailing slash from the path.
  if (fileInfo.isFile && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return movedPermanently(url);
  }
  // For directories, the path must have a trailing slash.
  if (fileInfo.isDirectory && !url.pathname.endsWith("/")) {
    // On directory listing pages,
    // if the current URL's pathname doesn't end with a slash, any
    // relative URLs in the index file will resolve against the parent
    // directory, rather than the current directory. To prevent that, we
    // return a 301 redirect to the URL with a slash.
    url.pathname += "/";
    return movedPermanently(url);
  }

  // if target is file, serve file.
  if (!fileInfo.isDirectory) {
    return serveFile(req, fsPath, {
      etagAlgorithm,
      fileInfo,
      etagDefault,
    });
  }

  // if target is directory, serve index or dir listing.
  if (showIndex) { // serve index.html
    const indexPath = join(fsPath, "index.html");

    const indexFileInfo = await stat(indexPath);
    if (indexFileInfo?.isFile) {
      return serveFile(req, indexPath, {
        etagAlgorithm,
        fileInfo: indexFileInfo,
        etagDefault,
      });
    }
  }

  return notFound();
}
