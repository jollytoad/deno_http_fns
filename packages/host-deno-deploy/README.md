# Helpers for hosting on Deno Deploy

Handy helper functions for initializing a server in
[Deno Deploy](https://deno.com/deploy).

```ts
import init from "@http/host-deno-deploy/init";
import handler from "./handler.ts";

await Deno.serve(init(handler)).finished;
```

It's a pretty simple function that provides some out of the box conveniences:

- Add [logging](https://jsr.io/@http/interceptor/doc/logger/~).
- Register [interceptors](https://jsr.io/@http/interceptor) passed as the
  remaining parameters after the handler.
- Provides a fallback response (404 Not Found), if the handler 'skips' (ie.
  returns `null`), as is the convention in `@http` routing functions (eg.
  `cascade`).
