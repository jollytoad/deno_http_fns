import type { DiscoveredPath, DiscoveredRoute } from "@http/discovery/types";

export default function txtRouteMapper(
  { ext, pattern }: DiscoveredPath,
): DiscoveredRoute[] {
  return ext === ".txt"
    ? [{
      pattern,
      module: import.meta.resolve("./handle_txt.ts"),
    }]
    : [];
}
