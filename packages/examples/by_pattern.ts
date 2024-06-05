import { withFallback } from "@http/route/with-fallback";
import { byPattern } from "@http/route/by-pattern";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    byPattern("/:path*", (_req, match) => {
      return new Response(`You are at ${match.pathname.groups.path}`);
    }),
  ),
) as Deno.HttpServer;

export default server;
