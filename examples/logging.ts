import { intercept } from "@http/fns/intercept.ts";
import { logging } from "@http/fns/interceptor/logger.ts";

export default Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
));
