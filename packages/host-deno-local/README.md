# Helpers for hosting on Deno localhost

Handy helper functions for initializing a localhost server in Deno, most
commonly for development.

```ts
import init from "@http/host-deno-local/init";
import handler from "./handler.ts";

await Deno.serve(init(handler)).finished;
```

It's a pretty simple function that provides some out of the box conveniences:

- Use `localhost-key.pem` & `localhost-cert.pem` files if they exist to
  configure a secure https server.
- Use `PORT` env var as the preferred port (default to 8000 if not set).
- Pick a randomly available port if the preferred port is not available.
- Add [logging](https://jsr.io/@http/interceptor/doc/logger/~).
- Register [interceptors](https://jsr.io/@http/interceptor) passed as the
  remaining parameters after the handler.
- Provides a fallback response (404 Not Found), if the handler 'skips' (ie.
  returns `null`), as is the convention in `@http` routing functions (eg.
  `cascade`).
- Log the server URL to console.

## Secure development server

The simplest way to setup `https` for localhost is to use
[mkcert](https://github.com/FiloSottile/mkcert).

If your are a [Homebrew](https://brew.sh/) user:

```sh
brew install mkcert nss
```

and then generate you localhost certificates:

```sh
mkcert -install -key-file localhost-key.pem -cert-file localhost-cert.pem localhost
```

Remember to add these files to your `.gitignore`.

You can now restart your dev server.

If you need to run as regular `http`, you can pass the `--http` command line arg
to your server, `init` will check for this and skip `https` setup.

## Utility functions

All of the individual features listed above are exported in their own modules to
give you more flexibility.
