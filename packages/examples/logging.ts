import { intercept } from "@http/interceptor/intercept";
import { logging } from "@http/interceptor/logger";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  intercept(
    () => new Response("Hello"),
    logging(),
  ),
) as Deno.HttpServer;

export default server;
