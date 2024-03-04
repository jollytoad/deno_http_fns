import { intercept } from "@http/fns/intercept";
import { logging } from "@http/fns/interceptor/logger";

export default Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
));
