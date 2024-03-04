import { staticRoute } from "@http/fns/static_route";
import { withFallback } from "@http/fns/with_fallback";

export default Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
));
