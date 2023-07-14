import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";

Deno.serve(withFallback(
  byPattern("/:path*", (_req, match) => {
    return new Response(`You are at ${match.pathname.groups.path}`);
  }),
));
