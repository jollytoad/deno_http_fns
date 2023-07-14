import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { cascade } from "https://deno.land/x/http_fns/cascade.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";

Deno.serve(withFallback(
  cascade(
    byPattern("/hello", () => {
      return new Response("Hello world");
    }),
    byPattern("/:path*", (_req, match) => {
      return new Response(`You are ${match.pathname.groups.path}`);
    }),
  ),
));
