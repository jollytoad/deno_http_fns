import { handle } from "@http/fns/handle";
import { byPattern } from "@http/fns/by_pattern";

export default Deno.serve(handle([
  byPattern("/hello", () => {
    return new Response("Hello world");
  }),
  byPattern("/more/:path*", (_req, match) => {
    return new Response(`You want more at ${match.pathname.groups.path}`);
  }),
]));
