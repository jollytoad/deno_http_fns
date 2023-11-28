import { handle } from "https://deno.land/x/http_fns/lib/handle.ts";
import { byPattern } from "https://deno.land/x/http_fns/lib/by_pattern.ts";
import { byMethod } from "https://deno.land/x/http_fns/lib/by_method.ts";
import { byMediaType } from "https://deno.land/x/http_fns/lib/by_media_type.ts";

export default Deno.serve(handle([
  byPattern(
    "/hello{.:ext}?",
    byMethod({
      GET: byMediaType({
        "text/plain": () => {
          return new Response("Hello world");
        },
        "text/html": () => {
          return new Response(
            "<html><body><h1>Hello world</h1></body></html>",
            {
              headers: {
                "Content-Type": "text/html",
              },
            },
          );
        },
        "application/json": () => {
          return new Response(
            JSON.stringify("Hello world"),
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        },
      }),
    }),
  ),
]));
