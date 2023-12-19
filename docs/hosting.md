# Hosting helper functions

These function help creating a server for a particular hosting environment.

## Deno Localhost

`initLocalhost(handler, ...interceptors)`

For creating a localhost development server.

```ts
import initLocalhost from "https://deno.land/x/http_fns/lib/hosting/init_localhost.ts";
import cors from "https://deno.land/x/http_fns/lib/cors.ts";

await Deno.serve(
  await init(
    () => new Response("Hello World"),
    cors(),
  ),
).finished;
```

`init` takes your main handler, adds a default fallback handler, the default
logging interceptors, and the given optionally interceptors. The example above
includes the CORS support interceptor.

It will look for a key and certificate file (named `localhost-key.pem` &
`localhost-cert.pem`) in the current working directory and use these to setup a
secure `https` server if found.

It will configure the server to listen on `localhost` and port `8000` or the
port set in the `PORT` environment variable, if reading env vars is permitted.

Once the server is running it will log the base URL to the console.

## Deno Deploy

`initDeploy(handler, ...interceptors)`

For creating a production Deploy server.

```ts
import init from "https://deno.land/x/http_fns/lib/hosting/init_deploy.ts";
import cors from "https://deno.land/x/http_fns/lib/cors.ts";

await Deno.serve(
  await init(
    () => new Response("Hello World"),
    cors(),
  ),
).finished;
```

Similar to `initLocalhost` but more appropriate for a Deno Deploy server.

It doesn't attempt to setup `https`, as Deploy does this for you, and listens on
the default host and port.
