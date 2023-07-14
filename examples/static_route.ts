import { staticRoute } from "../static.ts";
import { withFallback } from "../fallback.ts";

Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
));
