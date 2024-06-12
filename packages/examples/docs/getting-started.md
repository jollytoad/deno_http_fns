# Getting Started with **@http functions**

**@http functions** is not a framework, it's a library of functions that work
well together, but also with other frameworks (that use standard web APIs).

At present there is no `init` command to create a template app.

I feel the main benefit of using `@http` functions is the transparency of the
code, it is deliberated designed so that the runtime path is simple and easy to
follow. Indeed I encourage you to look inside the functions and get a feel for
what they do and how they work, they should hopefully be clear, and if not
please feel free to raise an issue to help improve that situation.

So with this in mind, this guide is a like a
[Linux From Scratch](https://www.linuxfromscratch.org/) but for a web app, using
this library of `@http` functions.

## Assumptions

I'm assuming you have [Deno installed](https://docs.deno.com/runtime/manual) and
your favourite IDE ready to work with it.

## What are we going to do?

- Create the basic project structure
- Add a request handler for `/`
- Generate a router from filesystem based routing structure
- Add static file routing
- Add production and development entry points
- Add a route with a pattern
- Add a path syntax mapper
- Add JSX support

## Project structure

First create a new folder for your project, and `cd` into it.

I put all utility scripts into `scripts`, and the app itself into `app`, this is
just a convention I like, you can structure it however you want.

```sh
mkdir app scripts
```

## Filesystem based routing

This is completely optional when using `@http` functions, you can manually
construct a router if you want to, and you can mix fs routing and manual routes
if you need to.

I like to put all my routes under `app/routes`:

```sh
mkdir app/routes
```

We can then put handlers under there and run a script to generate a module for
these routes, so that the whole app can be statically checked and deployed from
a single entrypoint.

### Root URL handler

Let's create a handler for `/`...

I'm making use of the response helpers, so first add that package...

```sh
deno add @http/response
```

Create `app/routes/index.ts`:

```ts
import { ok } from "@http/response/ok";

export function GET() {
  return ok("Hello");
}
```

Again, these helpers are completely optional, you can just use `new Response()`
if you prefer.

### Generate the router module

Next we'll want to generate the routes module for this:

```sh
deno add @http/generate
```

and create a script at `scripts/gen.ts`:

```ts
#!/usr/bin/env -S deno run --allow-ffi --allow-read=. --allow-write=. --allow-net=jsr.io

import { generateRoutesModule } from "@http/generate/generate-routes-module";

function generateRoutes() {
  console.debug("\nGenerating routes");

  return generateRoutesModule({
    fileRootUrl: import.meta.resolve("../app/routes"),
    moduleOutUrl: import.meta.resolve("../app/routes.ts"),
    moduleImports: "static",
    verbose: true,
  });
}

export default generateRoutes;

if (import.meta.main) {
  await generateRoutes();
}
```

and add a task into your `deno.json`:

```json
{
  "tasks": {
    "gen": "./scripts/gen.ts"
  }
}
```

and run it:

```sh
deno task gen
```

This should have created a file at `app/routes.ts`, take a look at this in your
editor.

You'll notice it imports some packages we haven't yet added...

```sh
deno add @http/route
```

The default export of this module is a simple Request -> Response handler for
all the routes in your filesystem.

Try switching `moduleImports` to `"dynamic"` and see what is generated in
`app/routes.ts` now, I'll let you work out what it's doing.

Take a look at the
[generateRoutesModule()](https://jsr.io/@http/generate/doc/generate-routes-module/~/generateRoutesModule)
function for more details along with the possible options you can supply.

Also, take a look at
[discoverRoutes()](https://jsr.io/@http/discovery/doc/discover-routes/~/discoverRoutes),
which is what the generator uses under the covers to discover routes in the
filesystem.

### The main application handler

Quite often you'll want to be able to serve up things independently of the
filesystem based routes (static files for example), and you may want to add
common behaviour (known as middleware in other routers).

You may also want to create multiple entry points for various purposes:
development, production, for deno deploy, for cloudflare, etc.

I like to create a single main handler that can then be imported into the the
different entry points.

And in this example, we'll add the ability to serve up static files.

```sh
mkdir app/static
deno add @http/route-deno
```

(`@http/route-deno` contains the Deno specific router function `staticRoute`)

Create `app/handler.ts`:

```ts
import routes from "./routes.ts";
import { handle } from "@http/route/handle";
import { staticRoute } from "@http/route-deno/static-route";

export default handle([
  routes,
  staticRoute("/", import.meta.resolve("./static")),
]);
```

This creates and exports a complete Request -> Response handler for our app,
serving the filesystem based routes first, and then fallback to static files,
and eventually falling back to a default `Not Found` response.

This `handler.ts` is module is where I'd add patterns that are too complex for
filesystem routing.

### The production entry point

For this example I won't assume any particular production environment.

Create a `app/main.ts`:

```ts
#!/usr/bin/env -S deno run --allow-net --allow-read=.

import handler from "./handler.ts";

await Deno.serve(handler).finished;
```

or you could use the new `deno serve` convention instead, and it's as simple as:

```ts
#!/usr/bin/env -S deno serve --allow-net --allow-read=.

import handler from "./handler.ts";

export default {
  fetch: handler,
};
```

and add a task to your `deno.json`:

```json
{
  "tasks": {
    ...
    "start:prod": "./app/main.ts"
  },
}
```

You now have a runnable app:

```sh
deno task start:prod
```

### The development entry point

During development we may want to do some additional or alternative
configuration, so I like to create a separate entry point for that, and use a
helper function to add logging, read local TLS certs etc.

We're also going to rebuild our routes module automatically on restart, so we
also need to be able to deal with an initially non-existing or modified routes
module.

```sh
deno add @http/host-deno-local
```

Create a `app/dev.ts`:

```ts
!/usr/bin/env -S deno run --allow-ffi --allow-read=. --allow-write=. --allow-net --watch

import generateRoutes from "../scripts/gen.ts";
import init from "@http/host-deno-local/init";

await generateRoutes();

// This allows loading of a new or modified routes.ts module
const handler = lazy(import.meta.resolve("./handler.ts"));

await Deno.serve(await init(handler)).finished;
```

and add a task to your `deno.json`:

```json
{
  "tasks": {
    ...
    "start": "./app/dev.ts"
  },
}
```

You now have a runnable dev server:

```sh
deno task start
```

BTW, you can name these entry points and tasks whatever you want, so
`deno task dev` if you prefer.

### URL Patterns

You can use
[URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
conventions in path names to match parameters, for example:

Create `routes/hello-:name.ts`:

```ts
import { ok } from "@http/response/ok";

export function GET(_req: Request, match: URLPatternResult) {
  return ok(`Hello ${match.pathname.groups.name!}`);
}
```

NOTE: The `URLPatternResult` pattern will be added by the `byPattern` function
that wraps this handler inthe generated router.

_"Hang on, you can't use `:` in a file name!"_ - I hear the Windows user scream.

Ok, so this syntax is fine if you are on Linux/Mac etc, but Windows is a bit
picky about restricted characters in filenames. So to support those users you'll
probably want some kind of alternative syntax, and something to map that syntax
to a valid `URLPattern`.

### Path Mappers

I don't want to enforce any particular syntax, so you can provide your own path
mapper to the route discovery/generator. And we provide a Fresh-like syntax
mapper out of the box.

Open your `routes/gen.ts` file again and add a new option:

```ts
return generateRoutesModule({
  ...
  pathMapper: "@http/discovery/fresh-path-mapper"
});
```

and add the import mapping for it:

```sh
deno add @http/discovery
```

You can now rename (or create) the route above as `routes/hello-[name].ts`.

Re-start your dev app, or run `deno task gen`, and take a look at the newly
generated `routes.ts` module, to see the mapping from the `URLPattern` syntax to
your handler file.

And hit http://localhost/hello-bob in your browser, to see it in action.

### Adding JSX support

This is completely optional, you can use whatever templating system you want,
but I actually like JSX.

This will give you server-side JSX streaming capability.

NOTE: This is not React, or Preact, there are no hooks or other React like
conventions, this is pure JSX to HTML serialization. JSX properties translate
exactly to HTML attributes.

```sh
deno add @http/jsx-stream
```

Edit your `deno.json` to enable JSX compilation...

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@http/jsx-stream"
  }
}
```

Create `routes/hello-[name].tsx` (replacing `routes/hello-[name].ts`):

```tsx
import { html } from "@http/response/html";
import { prependDocType } from "@http/response/prepend-doctype";
import { renderBody } from "@http/jsx-stream/serialize";

export function GET(_req: Request, match: URLPatternResult) {
  return html(
    prependDocType(
      renderBody(<Hello name={match.pathname.groups.name!} />),
    ),
  );
}

function Hello({ name }: { name: string }) {
  return (
    <html>
      <body>
        <h1>Hello {name}</h1>
      </body>
    </html>
  );
}
```

NOTE: The `renderBody` will serialize your JSX verbatim as a `ReadableStream` of
HTML. So the `prependDocType` function is required to tag `<!DOCTYPE html>` to
the start of your Response body.

### Now what?

Go and start tinkering.

And/or take a look at my [personal homepage](https://github.com/jollytoad/home),
which is built using `@http` functions, and runs on Deno Deploy. It may vary a
little from the conventions I describe here, but if you find the `dev.ts` &
`main.ts` entrypoints you should be able to follow every path in the entire app
from there.
