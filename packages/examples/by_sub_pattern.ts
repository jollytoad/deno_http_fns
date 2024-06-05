import { withFallback } from "@http/route/with-fallback";
import { byPattern } from "@http/route/by-pattern";
import { bySubPattern } from "@http/route/by-sub-pattern";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  withFallback(
    byPattern(
      "/:foo/*",
      bySubPattern("*/:bar", (_req, match) => {
        return new Response(`
You are at ${match.pathname.input}
:foo = ${match.pathname.groups.foo}
:bar = ${match.pathname.groups.bar}
`);
      }),
    ),
  ),
) as Deno.HttpServer;

export default server;
