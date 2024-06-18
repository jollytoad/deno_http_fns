import type { DiscoveredPath, StopRouteMapping } from "@http/discovery/types";

/**
 * Skip any route that has a path segment that starts with `_ignored_`
 */
export default function ignoredRouteMapper({ name, parentPath }: DiscoveredPath): StopRouteMapping[] {
  console.log("TEST", name, parentPath);
  return (name.startsWith("_ignored_") || /(^|[/\\])_ignored_/.test(parentPath))
    ? [{ stop: true }]
    : [];
}
