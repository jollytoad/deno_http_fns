import { withFallback } from "@http/fns/with_fallback.ts";
import { byPattern } from "@http/fns/by_pattern.ts";

export default Deno.serve(withFallback(
  byPattern("/:path*", (_req, match) => {
    return new Response(`You are at ${match.pathname.groups.path}`);
  }),
));
