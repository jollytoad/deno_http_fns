import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";

const server = Deno.serve(handle([
  byPattern("/hello", () => {
    return new Response("Hello world");
  }),
  byPattern("/more/:path*", (_req, match) => {
    return new Response(`You want more at ${match.pathname.groups.path}`);
  }),
])) as Deno.HttpServer;

export default server;
