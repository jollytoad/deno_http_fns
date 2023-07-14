import { intercept } from "../intercept.ts";
import { logging } from "../logger.ts";

Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
));
