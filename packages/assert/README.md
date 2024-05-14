# HTTP Assertions

Assertion functions for use in HTTP Request/Response related tests.

An [AssertionError](https://jsr.io/@std/assert/doc/~/AssertionError) will be
thrown for false assertions.

```ts
import { assertStatus, STATUS_CODE } from "@http/assert";

const response = new Response();

assertStatus(response, STATE_CODE.OK);
```

NOTE: the `STATUS_CODE` object and `StatusCode` type are re-exported from
`@std/http/status` for convenience.
