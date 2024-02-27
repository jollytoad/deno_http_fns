import { withFallback } from "@http/fns/with_fallback.ts";
import { cascade } from "@http/fns/cascade.ts";
import { byPattern } from "@http/fns/by_pattern.ts";

export default Deno.serve(withFallback(
  cascade(
    byPattern("/hello", () => {
      return new Response("Hello world");
    }),
    byPattern("/more/:path*", (_req, match) => {
      return new Response(`You want more at ${match.pathname.groups.path}`);
    }),
  ),
));
