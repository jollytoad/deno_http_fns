import { handle } from "https://deno.land/x/http_fns/handle.ts";
import { byPattern } from "https://deno.land/x/http_fns/pattern.ts";

Deno.serve(handle([
  byPattern("/hello", () => {
    return new Response("Hello world");
  }),
  byPattern("/:path*", (_req, match) => {
    return new Response(`You are ${match.pathname.groups.path}`);
  }),
]));
