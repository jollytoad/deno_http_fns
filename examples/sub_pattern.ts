import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";
import { bySubPattern } from "https://deno.land/x/http_fns/sub_pattern.ts";

Deno.serve(withFallback(
  byPattern(
    "/:foo/*",
    bySubPattern("*/:bar", (_req, match) => {
      return new Response(`
You are at ${match.pathname.input}
:foo = ${match.pathname.groups.foo}
:bar = ${match.pathname.groups.bar}
`);
    }),
  ),
));
