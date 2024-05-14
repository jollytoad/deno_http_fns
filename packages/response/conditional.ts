import { ifNoneMatch } from "@std/http/etag";
import { notModified } from "./not_modified.ts";

/**
 * Check the conditions of the Request against the Response,
 * and adjust the Response as necessary.
 *
 * Currently checks `etag` and `last-modified` response headers
 * against the `if-none-match` and `if-modified-since` request
 * headers.
 *
 * @param req The incoming request
 * @param res The desired response
 * @return Either the given desired response or a `304 Not Modified`
 *   response with only the headers of the desired response.
 */
export function conditional(req: Request, res: Response): Response {
  const etag = res.headers.get("etag") ?? undefined;
  const lastModified = res.headers.get("last-modified");

  if (etag || lastModified) {
    const ifNoneMatchValue = req.headers.get("if-none-match");
    const ifModifiedSinceValue = req.headers.get("if-modified-since");

    if (
      (!ifNoneMatch(ifNoneMatchValue, etag)) ||
      (ifNoneMatchValue === null &&
        lastModified &&
        ifModifiedSinceValue &&
        new Date(lastModified).getTime() <
          new Date(ifModifiedSinceValue).getTime() + 1000)
    ) {
      return notModified(res.headers);
    }
  }

  return res;
}
