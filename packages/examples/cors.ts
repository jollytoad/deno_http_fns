import { intercept } from "@http/interceptor/intercept";
import { cors } from "@http/interceptor/cors";

const server = Deno.serve(intercept(
  () => new Response("Hello"),
  cors(),
)) as Deno.HttpServer;

export default server;
