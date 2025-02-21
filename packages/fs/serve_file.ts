// Copyright 2024-2025 Mark Gibson. MIT license.
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.

// This has been adapted from jsr:@std/http/file-server (2024-07-10)

import { extname } from "@std/path/extname";
import { eTag, ifNoneMatch } from "@std/http/etag";
import { notFound } from "@http/response/not-found";
import { ok } from "@http/response/ok";
import { notModified } from "@http/response/not-modified";
import { rangeNotSatisfiable } from "@http/response/range-not-satisfiable";
import { partialContent } from "@http/response/partial-content";
import { fileBody } from "./file_body.ts";
import { stat } from "./stat.ts";
import type { FileStats } from "./types.ts";
import { isDirectory } from "./file_desc.ts";
import { fileNotFound } from "./file_not_found.ts";

/**
 * parse range header.
 *
 * ```ts ignore
 * parseRangeHeader("bytes=0-100",   500); // => { start: 0, end: 100 }
 * parseRangeHeader("bytes=0-",      500); // => { start: 0, end: 499 }
 * parseRangeHeader("bytes=-100",    500); // => { start: 400, end: 499 }
 * parseRangeHeader("bytes=invalid", 500); // => null
 * ```
 *
 * Note: Currently, no support for multiple Ranges (e.g. `bytes=0-10, 20-30`)
 */
function parseRangeHeader(rangeValue: string, fileSize: number) {
  const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
  const parsed = rangeValue.match(rangeRegex);

  if (!parsed || !parsed.groups) {
    // failed to parse range header
    return null;
  }

  const { start, end } = parsed.groups;
  if (start !== undefined) {
    if (end !== undefined) {
      return { start: +start, end: +end };
    } else {
      return { start: +start, end: fileSize - 1 };
    }
  } else {
    if (end !== undefined) {
      // example: `bytes=-100` means the last 100 bytes.
      return { start: fileSize - +end, end: fileSize - 1 };
    } else {
      // failed to parse range header
      return null;
    }
  }
}

/** Options for {@linkcode serveFile}. */
export interface ServeFileOptions {
  /**
   * The algorithm to use for generating the ETag.
   *
   * @default {"SHA-256"}
   */
  etagAlgorithm?: AlgorithmIdentifier;

  /** A default ETag value to fallback on if the file has no mtime */
  etagDefault?: string | Promise<string | undefined>;

  /**
   * An optional file stats object returned by `Deno.stat` or Node's `stat`.
   * It is used for optimization purposes.
   */
  fileInfo?: FileStats;

  /**
   * Override the default file extension to content-type header function.
   * Defaults to [`@std/media-types/contentType`](https://jsr.io/@std/media-types/doc/~/contentType).
   *
   * This function only needs to handle lowercase file-extensions with a `.` prefix
   * (eg: `.html`, `.js`, `.ts`), and return a complete `Content-Type` header.
   *
   * NOTE: although it uses `contentType` from `@std/media-types`, it does not need to be
   * compatible with it's behaviour of also accepting media type strings.
   *
   * It may also return `undefined`, in which case we'll fallback to using the
   * default `@std/media-types/contentType` function.
   */
  contentType?: (ext: string) => string | undefined;
}

/**
 * Resolves a {@linkcode Response} with the requested file as the body.
 *
 * @example Usage
 * ```ts no-eval
 * import { serveFile } from "@http/fs/serve-file";
 *
 * Deno.serve((req) => {
 *   return serveFile(req, "README.md");
 * });
 * ```
 *
 * @param req The server request context used to cleanup the file handle.
 * @param filePath Path of the file to serve.
 * @returns A response for the request.
 */
export async function serveFile(
  req: Request,
  filePath: string,
  { etagAlgorithm: algorithm, fileInfo, etagDefault, contentType }:
    ServeFileOptions = {},
): Promise<Response> {
  try {
    fileInfo ??= await stat(filePath);
  } catch (error: unknown) {
    if (!fileNotFound(error)) {
      throw error;
    }
  }

  if (!fileInfo) {
    return notFound();
  }

  if (isDirectory(fileInfo)) {
    return notFound();
  }

  const headers = new Headers({
    // Set "accept-ranges" so that the client knows it can make range requests on future requests
    "accept-ranges": "bytes",
  });

  // Set date header if access timestamp is available
  if (fileInfo.atime) {
    headers.set("date", fileInfo.atime.toUTCString());
  }

  const etag = fileInfo.mtime
    ? await eTag(fileInfo, { algorithm })
    : await etagDefault;

  // Set last modified header if last modification timestamp is available
  if (fileInfo.mtime) {
    headers.set("last-modified", fileInfo.mtime.toUTCString());
  }
  if (etag) {
    headers.set("etag", etag);
  }

  if (etag || fileInfo.mtime) {
    // If a `if-none-match` header is present and the value matches the tag or
    // if a `if-modified-since` header is present and the value is bigger than
    // the access timestamp value, then return 304
    const ifNoneMatchValue = req.headers.get("if-none-match");
    const ifModifiedSinceValue = req.headers.get("if-modified-since");
    if (
      (!ifNoneMatch(ifNoneMatchValue, etag)) ||
      (ifNoneMatchValue === null &&
        fileInfo.mtime &&
        ifModifiedSinceValue &&
        fileInfo.mtime.getTime() <
          new Date(ifModifiedSinceValue).getTime() + 1000)
    ) {
      return notModified(headers);
    }
  }

  const fileExt = extname(filePath).toLowerCase();

  // Set mime-type using the file extension in filePath
  const contentTypeValue = contentType?.(fileExt) ??
    (await import("@std/media-types/content-type")).contentType(fileExt);
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }

  const fileSize = fileInfo.size;

  const rangeValue = req.headers.get("range");

  // handle range request
  // Note: Some clients add a Range header to all requests to limit the size of the response.
  // If the file is empty, ignore the range header and respond with a 200 rather than a 416.
  // https://github.com/golang/go/blob/0d347544cbca0f42b160424f6bc2458ebcc7b3fc/src/net/http/fs.go#L273-L276
  if (rangeValue && 0 < fileSize) {
    const parsed = parseRangeHeader(rangeValue, fileSize);

    if (parsed) {
      // Return 416 Range Not Satisfiable if invalid range header value
      if (
        parsed.end < 0 ||
        parsed.end < parsed.start ||
        fileSize <= parsed.start
      ) {
        // Set the "Content-range" header
        headers.set("content-range", `bytes */${fileSize}`);

        return rangeNotSatisfiable(headers);
      }

      // clamps the range header value
      const start = Math.max(0, parsed.start);
      const end = Math.min(parsed.end, fileSize - 1);

      // Set the "Content-range" header
      headers.set("content-range", `bytes ${start}-${end}/${fileSize}`);

      // Set content length
      const contentLength = end - start + 1;
      headers.set("content-length", `${contentLength}`);

      const body = await fileBody(filePath, { start, end });

      // Return 206 Partial Content
      return body ? partialContent(body, headers) : notFound();
    }
  }

  // Set content length
  headers.set("content-length", `${fileSize}`);

  const body = await fileBody(filePath);

  return body ? ok(body, headers) : notFound();
}
