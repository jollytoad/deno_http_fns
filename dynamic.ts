import { byPattern } from "./pattern.ts";
import { lazy } from "./lazy.ts";
import { cascade } from "./cascade.ts";
import { walkRoutes } from "./walk.ts";

export type Eagerness = "startup" | "request";

/**
 * Create a handler that dynamically loads handler modules from the filesystem.
 *
 * @param pattern the root URL pattern, under which all found handlers are nested
 * @param fileRootUrl the root folder in the filesystem as a `file:` URL
 * @param eagerness whether route discovery will take place at `startup`,
 *   or will wait until the first `request` is made.
 * @returns a Request handler
 */
export function dynamicRoute(
  pattern: string,
  fileRootUrl: string,
  eagerness: Eagerness = "startup",
) {
  switch (eagerness) {
    case "startup": {
      // Build the handler eagerly, before the first request is made
      const handlerPromise = buildHandler(pattern, fileRootUrl);
      return lazy(() => handlerPromise);
    }

    case "request": {
      // Build the handler lazily, when the first request is made
      return lazy(() => buildHandler(pattern, fileRootUrl));
    }
  }
}

async function buildHandler(pattern: string, fileRootUrl: string) {
  return cascade(...(await walkRoutes(pattern, fileRootUrl)).map(asLazyRoute));
}

function asLazyRoute([modulePattern, moduleUrl]: [string, string]) {
  return byPattern(modulePattern, lazy(moduleUrl));
}
