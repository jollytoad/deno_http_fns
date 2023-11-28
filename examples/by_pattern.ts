import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";

Deno.serve(withFallback(
  byPattern("/:path*", (_req, match) => {
    return new Response(`You are at ${match.pathname.groups.path}`);
  }),
));
