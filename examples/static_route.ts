import { staticRoute } from "https://deno.land/x/http_fns/static.ts";
import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";

Deno.serve(withFallback(
  staticRoute("/", import.meta.resolve("./public"), { quiet: false }),
));
