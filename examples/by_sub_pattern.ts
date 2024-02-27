import { withFallback } from "@http/fns/with_fallback.ts";
import { byPattern } from "@http/fns/by_pattern.ts";
import { bySubPattern } from "@http/fns/by_sub_pattern.ts";

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
