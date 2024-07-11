// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.

// Adapted from @std/http/file-server, removing tests of removed features

import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import { serveDir, type ServeDirOptions } from "./serve_dir.ts";
import { serveFile } from "./serve_file.ts";
import { calculate as eTag } from "@std/http/etag";
import { dirname, fromFileUrl, join, resolve } from "@std/path";
import { MINUTE } from "@std/datetime/constants";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const testdataDir = resolve(moduleDir, "_testdata");
const serveDirOptions: ServeDirOptions = {
  fsRoot: testdataDir,
};

const TEST_FILE_PATH = join(testdataDir, "test_file.txt");
const TEST_FILE_STAT = await Deno.stat(TEST_FILE_PATH);
const TEST_FILE_SIZE = TEST_FILE_STAT.size;
const TEST_FILE_ETAG = await eTag(TEST_FILE_STAT) as string;
const TEST_FILE_LAST_MODIFIED = TEST_FILE_STAT.mtime instanceof Date
  ? new Date(TEST_FILE_STAT.mtime).toUTCString()
  : "";
const TEST_FILE_TEXT = await Deno.readTextFile(TEST_FILE_PATH);

Deno.test("serveDir() sets last-modified header", async () => {
  const req = new Request("http://localhost/test_file.txt");
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();
  const lastModifiedHeader = res.headers.get("last-modified") as string;
  const lastModifiedTime = Date.parse(lastModifiedHeader);
  const expectedTime = TEST_FILE_STAT.mtime instanceof Date
    ? TEST_FILE_STAT.mtime.getTime()
    : Number.NaN;

  assertAlmostEquals(lastModifiedTime, expectedTime, 5 * MINUTE);
});

Deno.test("serveDir() sets date header", async () => {
  const req = new Request("http://localhost/test_file.txt");
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();
  const dateHeader = res.headers.get("date") as string;
  const date = Date.parse(dateHeader);
  const expectedTime =
    TEST_FILE_STAT.atime && TEST_FILE_STAT.atime instanceof Date
      ? TEST_FILE_STAT.atime.getTime()
      : Number.NaN;

  assertAlmostEquals(date, expectedTime, 5 * MINUTE);
});

Deno.test("serveDir()", async () => {
  const req = new Request("http://localhost/hello.html");
  const res = await serveDir(req, serveDirOptions);
  const downloadedFile = await res.text();
  const localFile = await Deno.readTextFile(join(testdataDir, "hello.html"));

  assertEquals(res.status, 200);
  assertEquals(downloadedFile, localFile);
  assertEquals(res.headers.get("content-type"), "text/html; charset=UTF-8");
});

Deno.test("serveDir() with hash symbol in filename", async () => {
  const filePath = join(testdataDir, "file#2.txt");
  const text = "Plain text";
  await Deno.writeTextFile(filePath, text);

  const req = new Request("http://localhost/file%232.txt");
  const res = await serveDir(req, serveDirOptions);
  const downloadedFile = await res.text();

  assertEquals(res.status, 200);
  assertEquals(
    res.headers.get("content-type"),
    "text/plain; charset=UTF-8",
  );
  assertEquals(downloadedFile, text);

  await Deno.remove(filePath);
});

Deno.test("serveDir() with space in filename", async () => {
  const filePath = join(testdataDir, "test file.txt");
  const text = "Plain text";
  await Deno.writeTextFile(filePath, text);

  const req = new Request("http://localhost/test%20file.txt");
  const res = await serveDir(req, serveDirOptions);
  const downloadedFile = await res.text();

  assertEquals(res.status, 200);
  assertEquals(
    res.headers.get("content-type"),
    "text/plain; charset=UTF-8",
  );
  assertEquals(downloadedFile, text);

  await Deno.remove(filePath);
});

Deno.test("serveDir() handles not found files", async () => {
  const req = new Request("http://localhost/badfile.txt");
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.status, 404);
});

Deno.test("serveDir() traverses encoded URI path", async () => {
  const req = new Request(
    "http://localhost/%2F..%2F..%2F..%2F..%2F..%2F..%2F..%2F..",
  );
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.status, 301);
  assertEquals(res.headers.get("location"), "http://localhost/");
});

Deno.test("serveDir() serves unusual filename", async () => {
  const filePath = join(testdataDir, "%");
  using _file = await Deno.create(filePath);

  const req1 = new Request("http://localhost/%25");
  const res1 = await serveDir(req1, serveDirOptions);
  await res1.body?.cancel();

  assertEquals(res1.status, 200);

  const req2 = new Request("http://localhost/test_file.txt");
  const res2 = await serveDir(req2, serveDirOptions);
  await res2.body?.cancel();

  assertEquals(res2.status, 200);

  await Deno.remove(filePath);
});

Deno.test("serveDir() ignores query params", async () => {
  const req = new Request("http://localhost/hello.html?key=value");
  const res = await serveDir(req, serveDirOptions);
  const downloadedFile = await res.text();
  const localFile = await Deno.readTextFile(join(testdataDir, "hello.html"));

  assertEquals(res.status, 200);
  assertEquals(downloadedFile, localFile);
});

Deno.test("serveDir() doesn't show directory listings", async () => {
  const req = new Request("http://localhost/");
  const res = await serveDir(req, {
    ...serveDirOptions,
  });
  await res.body?.cancel();

  assertEquals(res.status, 404);
});

Deno.test("serveDir() handles range request (bytes=0-0)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=0-0" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(text, "L");
});

Deno.test("serveDir() handles range request (bytes=0-100)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=0-100" },
  });
  const res = await serveDir(req, serveDirOptions);

  assertEquals(
    res.headers.get("content-range"),
    `bytes 0-100/${TEST_FILE_SIZE}`,
  );
  assertEquals(res.status, 206);
  assertEquals((await res.arrayBuffer()).byteLength, 101);
});

Deno.test("serveDir() handles range request (bytes=300-)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=300-" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(
    res.headers.get("content-range"),
    `bytes 300-${TEST_FILE_SIZE - 1}/${TEST_FILE_SIZE}`,
  );
  assertEquals(text, TEST_FILE_TEXT.substring(300));
});

Deno.test("serveDir() handles range request (bytes=-200)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=-200" },
  });
  const res = await serveDir(req, serveDirOptions);

  assertEquals(await res.text(), TEST_FILE_TEXT.slice(-200));
  assertEquals(
    res.headers.get("content-range"),
    `bytes ${TEST_FILE_SIZE - 200}-${TEST_FILE_SIZE - 1}/${TEST_FILE_SIZE}`,
  );
  assertEquals(res.status, 206);
  assertEquals(res.statusText, "Partial Content");
});

Deno.test("serveDir() clamps ranges that are too large (bytes=0-999999999)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=0-999999999" },
  });
  const res = await serveDir(req, serveDirOptions);

  assertEquals(await res.text(), TEST_FILE_TEXT);
  assertEquals(
    res.headers.get("content-range"),
    `bytes 0-${TEST_FILE_SIZE - 1}/${TEST_FILE_SIZE}`,
  );
  assertEquals(res.status, 206);
  assertEquals(res.statusText, "Partial Content");
});

Deno.test("serveDir() clamps ranges that are too large (bytes=-999999999)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    // This means the last 999999999 bytes. It is too big and should be clamped.
    headers: { range: "bytes=-999999999" },
  });
  const res = await serveDir(req, serveDirOptions);

  assertEquals(await res.text(), TEST_FILE_TEXT);
  assertEquals(
    res.headers.get("content-range"),
    `bytes 0-${TEST_FILE_SIZE - 1}/${TEST_FILE_SIZE}`,
  );
  assertEquals(res.status, 206);
  assertEquals(res.statusText, "Partial Content");
});

Deno.test("serveDir() handles bad range request (bytes=500-200)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=500-200" },
  });
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.headers.get("content-range"), `bytes */${TEST_FILE_SIZE}`);
  assertEquals(res.status, 416);
  assertEquals(res.statusText, "Range Not Satisfiable");
});

Deno.test("serveDir() handles bad range request (bytes=99999-999999)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=99999-999999" },
  });
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.headers.get("content-range"), `bytes */${TEST_FILE_SIZE}`);
  assertEquals(res.status, 416);
  assertEquals(res.statusText, "Range Not Satisfiable");
});

Deno.test("serveDir() handles bad range request (bytes=99999)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=99999-" },
  });
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.headers.get("content-range"), `bytes */${TEST_FILE_SIZE}`);
  assertEquals(res.status, 416);
  assertEquals(res.statusText, "Range Not Satisfiable");
});

Deno.test("serveDir() ignores bad range request (bytes=100)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=100" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(text, TEST_FILE_TEXT);
  assertEquals(res.status, 200);
  assertEquals(res.statusText, "OK");
});

Deno.test("serveDir() ignores bad range request (bytes=a-b)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=a-b" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(text, TEST_FILE_TEXT);
  assertEquals(res.status, 200);
  assertEquals(res.statusText, "OK");
});

Deno.test("serveDir() ignores bad multi-range request (bytes=0-10, 20-30)", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { range: "bytes=0-10, 20-30" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(text, TEST_FILE_TEXT);
  assertEquals(res.status, 200);
  assertEquals(res.statusText, "OK");
});

Deno.test("serveFile() serves ok response for empty file range request", async () => {
  const req = new Request("http://localhost/test_empty_file.txt", {
    headers: { range: "bytes=0-10, 20-30" },
  });
  const res = await serveDir(req, serveDirOptions);
  const text = await res.text();

  assertEquals(text, "");
  assertEquals(res.status, 200);
  assertEquals(res.statusText, "OK");
});

Deno.test("serveDir() sets accept-ranges header to bytes for file response", async () => {
  const req = new Request("http://localhost/test_file.txt");
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.headers.get("accept-ranges"), "bytes");
});

Deno.test("serveDir() sets etag header", async () => {
  const req = new Request("http://localhost/test_file.txt");
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.headers.get("etag"), TEST_FILE_ETAG);
});

Deno.test("serveDir() serves empty HTTP 304 response for if-none-match request of unmodified file", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { "if-none-match": TEST_FILE_ETAG },
  });
  const res = await serveDir(req, serveDirOptions);

  assertEquals(await res.text(), "");
  assertEquals(res.status, 304);
  assertEquals(res.statusText, "Not Modified");
});

Deno.test("serveDir() serves HTTP 304 response for if-modified-since request of unmodified file", async () => {
  const req = new Request("http://localhost/test_file.txt", {
    headers: { "if-modified-since": TEST_FILE_LAST_MODIFIED },
  });
  const res = await serveDir(req, serveDirOptions);
  await res.body?.cancel();

  assertEquals(res.status, 304);
  assertEquals(res.statusText, "Not Modified");
});

/**
 * When used in combination with If-None-Match, If-Modified-Since is ignored.
 * If etag doesn't match, don't return 304 even if if-modified-since is a valid
 * value.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since}
 */
Deno.test(
  "serveDir() only uses if-none-match header if if-non-match and if-modified-since headers are provided",
  async () => {
    const req = new Request("http://localhost/test_file.txt", {
      headers: {
        "if-none-match": "not match etag",
        "if-modified-since": TEST_FILE_LAST_MODIFIED,
      },
    });
    const res = await serveDir(req, serveDirOptions);
    await res.body?.cancel();

    assertEquals(res.status, 200);
    assertEquals(res.statusText, "OK");
  },
);

Deno.test("serveFile() serves test file", async () => {
  const req = new Request("http://localhost/testdata/test_file.txt");
  const res = await serveFile(req, TEST_FILE_PATH);

  assertEquals(res.status, 200);
  assertEquals(await res.text(), TEST_FILE_TEXT);
});

Deno.test("serveFile() handles file not found", async () => {
  const req = new Request("http://localhost/testdata/non_existent.txt");
  const testdataPath = join(testdataDir, "non_existent.txt");
  const res = await serveFile(req, testdataPath);
  await res.body?.cancel();

  assertEquals(res.status, 404);
  assertEquals(res.statusText, "Not Found");
});

Deno.test("serveFile() serves HTTP 404 when the path is a directory", async () => {
  const req = new Request("http://localhost/testdata/");
  const res = await serveFile(req, testdataDir);
  await res.body?.cancel();

  assertEquals(res.status, 404);
  assertEquals(res.statusText, "Not Found");
});

Deno.test("serveFile() handles bad range request (bytes=200-500)", async () => {
  const req = new Request("http://localhost/testdata/test_file.txt", {
    headers: { range: "bytes=200-500" },
  });
  const res = await serveFile(req, TEST_FILE_PATH);

  assertEquals(res.status, 206);
  assertEquals((await res.arrayBuffer()).byteLength, 301);
});

Deno.test("serveFile() handles bad range request (bytes=500-200)", async () => {
  const req = new Request("http://localhost/testdata/test_file.txt", {
    headers: { range: "bytes=500-200" },
  });
  const res = await serveFile(req, TEST_FILE_PATH);
  await res.body?.cancel();

  assertEquals(res.status, 416);
});

Deno.test("serveFile() serves HTTP 304 response for if-modified-since request of unmodified file", async () => {
  const req = new Request("http://localhost/testdata/test_file.txt", {
    headers: { "if-none-match": TEST_FILE_ETAG },
  });
  const res = await serveFile(req, TEST_FILE_PATH);

  assertEquals(res.status, 304);
  assertEquals(res.statusText, "Not Modified");
});

/**
 * When used in combination with If-None-Match, If-Modified-Since is ignored.
 * If etag doesn't match, don't return 304 even if if-modified-since is a valid
 * value.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since}
 */
Deno.test("serveFile() only uses if-none-match header if if-non-match and if-modified-since headers are provided", async () => {
  const req = new Request("http://localhost/testdata/test_file.txt", {
    headers: {
      "if-none-match": "not match etag",
      "if-modified-since": TEST_FILE_LAST_MODIFIED,
    },
  });
  const res = await serveFile(req, TEST_FILE_PATH);
  await res.body?.cancel();

  assertEquals(res.status, 200);
  assertEquals(res.statusText, "OK");
});

Deno.test("serveDir() without options serves files in current directory", async () => {
  const req = new Request(
    "http://localhost/packages/fs/_testdata/hello.html",
  );
  const res = await serveDir(req);

  assertEquals(res.status, 200);
  assertStringIncludes(await res.text(), "Hello World");
});

Deno.test("serveDir() with fsRoot and urlRoot option serves files in given directory", async () => {
  const req = new Request(
    "http://localhost/my-static-root/_testdata/hello.html",
  );
  const res = await serveDir(req, {
    fsRoot: "packages/fs",
    urlRoot: "my-static-root",
  });

  assertEquals(res.status, 200);
  assertStringIncludes(await res.text(), "Hello World");
});

Deno.test("serveDir() serves index.html when showIndex is true", async () => {
  const url = "http://localhost/packages/fs/_testdata/subdir-with-index/";
  const expectedText = "This is subdir-with-index/index.html";
  {
    const res = await serveDir(new Request(url), { showIndex: true });
    assertEquals(res.status, 200);
    assertStringIncludes(await res.text(), expectedText);
  }

  {
    // showIndex is true by default
    const res = await serveDir(new Request(url));
    assertEquals(res.status, 200);
    assertStringIncludes(await res.text(), expectedText);
  }
});

Deno.test("serveDir() doesn't serve index.html when showIndex is false", async () => {
  const req = new Request(
    "http://localhost/packages/fs/_testdata/subdir-with-index/",
  );
  const res = await serveDir(req, { showIndex: false });

  assertEquals(res.status, 404);
});

Deno.test(
  "serveDir() redirects a directory URL not ending with a slash if it has an index",
  async () => {
    const url = "http://localhost/packages/fs/_testdata/subdir-with-index";
    const res = await serveDir(new Request(url), { showIndex: true });

    assertEquals(res.status, 301);
    assertEquals(
      res.headers.get("Location"),
      "http://localhost/packages/fs/_testdata/subdir-with-index/",
    );
  },
);

Deno.test("serveDir() redirects a directory URL not ending with a slash correctly even with a query string", async () => {
  const url = "http://localhost/packages/fs/_testdata/subdir-with-index?test";
  const res = await serveDir(new Request(url), { showIndex: true });

  assertEquals(res.status, 301);
  assertEquals(
    res.headers.get("Location"),
    "http://localhost/packages/fs/_testdata/subdir-with-index/?test",
  );
});

Deno.test("serveDir() redirects a file URL ending with a slash correctly even with a query string", async () => {
  const url = "http://localhost/packages/fs/_testdata/test_file.txt/?test";
  const res = await serveDir(new Request(url), { showIndex: true });

  assertEquals(res.status, 301);
  assertEquals(
    res.headers.get("Location"),
    "http://localhost/packages/fs/_testdata/test_file.txt?test",
  );
});

Deno.test("serveDir() redirects non-canonical URLs", async () => {
  const url = "http://localhost/http/testdata//////test_file.txt/////?test";
  const res = await serveDir(new Request(url), { showIndex: true });

  assertEquals(res.status, 301);
  assertEquals(
    res.headers.get("Location"),
    "http://localhost/http/testdata/test_file.txt/?test",
  );
});

Deno.test("serveDir() serves HTTP 304 for if-none-match requests with W/-prefixed etag", async () => {
  const testurl = "http://localhost/desktop.ini";
  const fileurl = new URL("./_testdata/desktop.ini", import.meta.url);
  const req1 = new Request(testurl, {
    headers: { "accept-encoding": "gzip, deflate, br" },
  });
  const res1 = await serveDir(req1, serveDirOptions);
  const etag = res1.headers.get("etag");

  assertEquals(res1.status, 200);
  assertEquals(res1.statusText, "OK");
  assertEquals(await Deno.readTextFile(fileurl), await res1.text());
  assert(typeof etag === "string");
  assert(etag.length > 0);
  assert(etag.startsWith("W/"));

  const req2 = new Request(testurl, {
    headers: { "if-none-match": etag },
  });
  const res2 = await serveDir(req2, serveDirOptions);

  assertEquals(res2.status, 304);
  assertEquals(res2.statusText, "Not Modified");
  assertEquals("", await res2.text());
  assert(
    etag === res2.headers.get("etag") ||
      etag === "W/" + res2.headers.get("etag"),
  );
});
