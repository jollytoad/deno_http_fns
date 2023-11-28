import { intercept } from "https://deno.land/x/http_fns/lib/intercept.ts";
import { logging } from "https://deno.land/x/http_fns/lib/logger.ts";

Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
));
