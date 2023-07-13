import type {
  Args,
  CustomHandler,
  RoutePattern,
  SerializableRoutePattern,
  SingleRoutePattern,
} from "./types.ts";

export type RouteHandler = CustomHandler<[URLPatternResult]>;

/**
 * Create a Request handler that matches the URL of the Request based on a URLPattern.
 *
 * @param pattern the URL pattern to match against the Request URL
 * @param handler handler to call if the pattern matches, it should
 *  take the Request and the URLPatternResult as arguments
 * @returns a Request handler that returns a Response or null
 */
export function byPattern<A extends Args>(
  pattern: RoutePattern,
  handler: RouteHandler,
): CustomHandler<A> {
  return async (req, ..._args) => {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const url = new URL(req.url);

    for (const pattern of patterns) {
      const match = asURLPattern(pattern).exec(url);

      if (match) {
        const res = await handler(req, match);
        if (res) {
          return res;
        }
      }
    }

    return null;
  };
}

/**
 * Convert a single RoutePattern to a URLPattern.
 */
export function asURLPattern(
  pattern: SingleRoutePattern,
): URLPattern {
  return typeof pattern === "string"
    ? new URLPattern({ pathname: pattern })
    : pattern instanceof URLPattern
    ? pattern
    : new URLPattern(pattern);
}

/**
 * Return the most concise serialisable representation of the given RoutePattern.
 */
export function asSerializablePattern(
  pattern: RoutePattern,
): SerializableRoutePattern {
  if (Array.isArray(pattern)) {
    return pattern.flatMap(asSerializablePattern);
  } else if (typeof pattern === "string") {
    return pattern;
  } else {
    const {
      protocol,
      username,
      password,
      hostname,
      port,
      pathname,
      search,
      hash,
    } = pattern;

    if (
      typeof pathname === "string" && isWild(protocol) && isWild(username) &&
      isWild(password) && isWild(hostname) && isWild(port) && isWild(search) &&
      isWild(hash)
    ) {
      return pathname;
    } else {
      return {
        protocol: asPart(protocol),
        username: asPart(username),
        password: asPart(password),
        hostname: asPart(hostname),
        port: asPart(port),
        pathname: asPart(pathname),
        search: asPart(search),
        hash: asPart(hash),
      };
    }
  }
}

function isWild(part: string | undefined): boolean {
  return part === undefined || part === "*";
}

function asPart(part: string | undefined): string | undefined {
  return isWild(part) ? undefined : part;
}
