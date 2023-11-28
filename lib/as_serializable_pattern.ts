import type { RoutePattern, SerializableRoutePattern } from "./types.ts";

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
