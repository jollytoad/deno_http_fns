import { byPattern } from "./pattern.ts";
import { lazy } from "./lazy.ts";
import { cascade } from "./cascade.ts";
import { walkRoutes } from "./walk.ts";

/**
 * Create a handler that dynamically loads handler modules from the filesystem.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @returns a Request handler
 */
export function dynamicRoute(pattern: string, fileRootUrl: string) {
  return cascade(...[...walkRoutes(pattern, fileRootUrl)].map(asLazyRoute));
}

function asLazyRoute([modulePattern, moduleUrl]: [string, string]) {
  return byPattern(modulePattern, lazy(moduleUrl));
}
