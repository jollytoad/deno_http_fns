import { withFallback } from "@http/fns/with_fallback";
import { byPattern } from "@http/fns/by_pattern";
import { bySubPattern } from "@http/fns/by_sub_pattern";

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
