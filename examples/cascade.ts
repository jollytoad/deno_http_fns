import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { cascade } from "https://deno.land/x/http_fns/lib/cascade.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";

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
