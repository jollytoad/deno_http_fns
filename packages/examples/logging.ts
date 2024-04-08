import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";

const server = Deno.serve(intercept(
  () => new Response("Hello"),
  logging(),
)) as Deno.HttpServer;

export default server;
