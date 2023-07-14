import { withFallback } from "https://deno.land/x/http_fns/fallback.ts";
import { dynamicRoute } from "https://deno.land/x/http_fns/dynamic.ts";
import freshPathMapper from "https://deno.land/x/http_fns/fresh/path_mapper.ts";

Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
));
