import { handle } from "@http/fns/handle.ts";
import { byPattern } from "@http/fns/by_pattern.ts";
import { byMethod } from "@http/fns/by_method.ts";
import { byMediaType } from "@http/fns/by_media_type.ts";

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
