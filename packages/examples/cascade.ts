import { withFallback } from "@http/route/with-fallback";
import { cascade } from "@http/route/cascade";
import { byPattern } from "@http/route/by-pattern";

const server = Deno.serve(withFallback(
  cascade(
    byPattern("/hello", () => {
      return new Response("Hello world");
    }),
    byPattern("/more/:path*", (_req, match) => {
      return new Response(`You want more at ${match.pathname.groups.path}`);
    }),
  ),
)) as Deno.HttpServer;

export default server;
