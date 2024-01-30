import type { Awaitable } from "../lib/types.ts";

export type PathSegment = string;
export type PathSegmentHandlers<A extends unknown[]> = Record<
  PathSegment,
  (req: Request, segment: PathSegment, ...args: A) => Awaitable<Response | null>
>;

/**
 * Create a Request handler that matches the first path segment of the URL of the Request.
 *
 * _TODO_: Include a URLPattern
 *
 * @param handlers an object of handlers, where the key is the first path segment
 * @returns a Request handler that returns a Response or null
 */
export function bySegment<A extends unknown[]>(
  handlers: PathSegmentHandlers<A>,
) {
  return (req: Request, ...args: A) => {
    const segment = firstSegment(req.url);
    return handlers[segment]?.(req, segment, ...args) ?? null;
  };
}

function firstSegment(url: string): string {
  return new URL(url).pathname.split("/", 1)[0];
}
