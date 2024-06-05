import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  handle([
    byPattern(
      "/hello",
      byMethod({
        GET: () => {
          return new Response("Hello world");
        },
      }),
    ),
    byPattern(
      "/:path*",
      byMethod({
        GET: (_req, match) => {
          return new Response(`GET from ${match.pathname.groups.path}`);
        },
        PUT: (_req, match) => {
          return new Response(`PUT to ${match.pathname.groups.path}`);
        },
      }),
    ),
  ]),
) as Deno.HttpServer;

export default server;
