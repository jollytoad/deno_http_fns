import { staticRoute } from "@http/fns/static_route.ts";
import { withFallback } from "@http/fns/with_fallback.ts";

export default Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
));
