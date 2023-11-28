import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";
import { bySubPattern } from "https://deno.land/x/http_fns/lib/by_sub_pattern.ts";

export default Deno.serve(withFallback(
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
