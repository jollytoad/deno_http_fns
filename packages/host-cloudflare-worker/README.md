# Helpers for hosting on Cloudflare Workers & Pages

Handy helper functions for initializing a server in
[Cloudflare Workers](https://developers.cloudflare.com/workers) and
[Cloudflare Pages](https://developers.cloudflare.com/pages).

```ts
import init from "@http/host-cloudflare-worker/init";
import handler from "./handler.ts";

export default init(handler);
```

It's a pretty simple function that provides some out of the box conveniences:

- Add [logging](https://jsr.io/@http/interceptor/doc/logger/~).
- Register [interceptors](https://jsr.io/@http/interceptor) passed as the
  remaining parameters after the handler.
- Provides a fallback response (404 Not Found), if the handler 'skips' (ie.
  returns `null`), as is the convention in `@http` routing functions (eg.
  `cascade`).

## Cloudflare Pages

If you want to run on Cloudflare Pages we provide a handler for assets, which
you can incorporate before, after or anywhere you want within your regular
handlers.

Prioritise assets over other routes:

```ts
import init from "@http/host-cloudflare-worker/init";
import { assetHandler } from "@http/host-cloudflare-worker/asset-handler";
import { cascade } from "@http/route/cascade";
import handler from "./handler.ts";

export default init(cascade(assetHandler, handler));
```

or fallback on assets after other routes:

```ts
export default init(cascade(handler, assetHandler));
```
