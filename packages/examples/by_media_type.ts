import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
import { byMediaType } from "@http/route/by-media-type";
import { port } from "@http/host-deno-local/port";

const server = Deno.serve(
  { port: port() },
  handle([
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
  ]),
) as Deno.HttpServer;

export default server;
