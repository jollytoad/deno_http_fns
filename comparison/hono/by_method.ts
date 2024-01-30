import { type Context, Hono } from "https://deno.land/x/hono/mod.ts";

const app = new Hono();

app.get("/hello", (c: Context) => {
  return c.text("Hello world");
});
app.get("/:path{.*}", (c: Context) => {
  console.log(c);
  return c.text(`GET from ${c.req.param("path")}`);
});
app.put("/:path{.*}", (c: Context) => {
  return c.text(`PUT to ${c.req.param("path")}`);
});

export default Deno.serve(app.fetch);
