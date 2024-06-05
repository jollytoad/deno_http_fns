import { intercept } from "@http/interceptor/intercept";
import { cors } from "@http/interceptor/cors";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  intercept(
    () => new Response("Hello"),
    cors(),
  ),
) as Deno.HttpServer;

export default server;
