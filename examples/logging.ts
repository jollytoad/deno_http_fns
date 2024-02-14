import { intercept } from "https://deno.land/x/http_fns/lib/intercept.ts";
import { logging } from "https://deno.land/x/http_fns/lib/interceptor/logger.ts";

export default Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
));
