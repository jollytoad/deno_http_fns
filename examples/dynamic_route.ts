import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { dynamicRoute } from "https://deno.land/x/http_fns/dynamic.ts";

Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    eagerness: "startup",
    verbose: true,
  }),
));
