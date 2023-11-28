import { withFallback } from "https://deno.land/x/http_fns/lib/with_fallback.ts";
import { dynamicRoute } from "https://deno.land/x/http_fns/lib/dynamic_route.ts";
import freshPathMapper from "https://deno.land/x/http_fns/lib/fresh/path_mapper.ts";

Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
));
