import { ifNoneMatch } from "jsr:@std/http@0.217/etag";
import { notModified } from "./not_modified.ts";

/**
 * Check the conditions of the Request against the Response,
 * and adjust the Response as necessary.
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
