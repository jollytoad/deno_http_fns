import { type Context, Hono } from "https://deno.land/x/hono/mod.ts";

const app = new Hono();

app.all("/:path{.*}", (c: Context) => {
  return c.text(`You are at ${c.req.param("path")}`);
});

export default Deno.serve(app.fetch);
