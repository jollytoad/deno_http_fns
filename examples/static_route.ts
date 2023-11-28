import { staticRoute } from "https://deno.land/x/http_fns/lib/static_route.ts";
import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";

export default Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
));
