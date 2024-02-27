import { withFallback } from "@http/fns/with_fallback.ts";
import { dynamicRoute } from "@http/fns/dynamic_route.ts";
import freshPathMapper from "@http/fns/fresh/path_mapper.ts";

export default Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
));
