import { withFallback } from "@http/fns/with_fallback";
import { dynamicRoute } from "@http/fns/dynamic_route";
import freshPathMapper from "@http/fns/fresh/path_mapper";

export default Deno.serve(withFallback(
  dynamicRoute({
    pattern: "/",
    fileRootUrl: import.meta.resolve("./routes"),
    pathMapper: freshPathMapper,
    eagerness: "startup",
    verbose: true,
  }),
));
