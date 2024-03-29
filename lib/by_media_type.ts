import { appendHeaders } from "./response/append_headers.ts";
import { notAcceptable } from "./response/not_acceptable.ts";
import { notFound } from "./response/not_found.ts";
import { accepts } from "https://deno.land/std@0.215.0/http/negotiation.ts";
import { typeByExtension } from "https://deno.land/std@0.215.0/media_types/type_by_extension.ts";
import { extname } from "https://deno.land/std@0.215.0/path/posix/extname.ts";
import type { Awaitable } from "./types.ts";

export type MediaType = `${string}/${string}`;
export type MediaTypeHandlers<A extends unknown[]> = Record<
  MediaType,
  (req: Request, ...args: A) => Awaitable<Response | null>
>;

/**
 * Create a Request handler that delegates based on the desired media-type of the Request.
 *
 * The media-type is determined by extension on the URL path if it has one, otherwise it
 * will examine the `Accept` header and choose the most appropriate type supplied.
 *
 * @param handlers an object of handlers, where the key is the media-type
 * @param fallbackExt called when the URL has an extension but no handler matches, defaults
 *  to returning a Not Found response
 * @param fallbackAccept called when the URL doesn't have an extension and a type handler
 *  can not be matched from the `Accept` header, defaults to a Not Acceptable response
 * @returns a Request handler
 */
export function byMediaType<A extends unknown[]>(
  handlers: MediaTypeHandlers<A>,
  fallbackExt: (req: Request, ...args: A) => Awaitable<Response | null> = () =>
    notFound(),
  fallbackAccept: (req: Request, ...args: A) => Awaitable<Response | null> =
    () => notAcceptable(),
) {
  return async (req: Request, ...args: A) => {
    const ext = getExt(req, ...args);
    if (ext) {
      // Return only the media type implied by the extension on the url, ignoring the Accept header

      const mediaType = typeByExtension(ext) as
        | MediaType
        | undefined;

      return mediaType && handlers[mediaType]
        ? handlers[mediaType](req, ...args)
        : fallbackExt(req, ...args);
    } else {
      // Return the appropriate media type according to the Accept header

      const availableMediaTypes = Object.keys(handlers);
      const mediaType = accepts(req, ...availableMediaTypes) as
        | MediaType
        | undefined;

      let response = await (mediaType
        ? handlers[mediaType](req, ...args)
        : fallbackAccept(req, ...args));

      if (response) {
        response = appendHeaders(response, { "Vary": "Accept" });
      }

      return response;
    }
  };
}

// deno-lint-ignore no-explicit-any
function getExt(req: Request, info?: any): string {
  if (typeof info?.pathname?.groups?.ext === "string") {
    return info.pathname.groups.ext;
  } else if (typeof info?.pathname?.input === "string") {
    return extname(info.pathname.input);
  } else {
    return extname(new URL(req.url).pathname);
  }
}
