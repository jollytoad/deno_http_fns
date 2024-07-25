# Helpers for hosting on Bun localhost

Handy helper functions for initializing a localhost server in Bun, most commonly
for development.

```ts
import init from "@http/host-bun-local/init";
import handler from "./handler.ts";

const server = Bun.serve(await init(handler));

console.log(`Listening on ${server.url}`);
```

It's a pretty simple function that provides some out of the box conveniences:

- Use `localhost-key.pem` & `localhost-cert.pem` files if they exist to
  configure a secure https server.
- Add [logging](https://jsr.io/@http/interceptor/doc/logger/~).
- Register [interceptors](https://jsr.io/@http/interceptor) passed as the
  remaining parameters after the handler.
- Provides a fallback response (404 Not Found), if the handler 'skips' (ie.
  returns `null`), as is the convention in `@http` routing functions (eg.
  `cascade`).

## Polyfills

Bun doesn't yet support [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern),
so you may need to include the [polyfill](https://www.npmjs.com/package/urlpattern-polyfill) if
you make use of any `@http` functions that use it, `byPattern()` for example.

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
