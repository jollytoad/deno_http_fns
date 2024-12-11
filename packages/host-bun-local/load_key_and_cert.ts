const KEY_FILE = "localhost-key.pem";
const CERT_FILE = "localhost-cert.pem";

export interface KeyAndCert {
  key: string;
  cert: string;
}

interface Bun {
  argv: string[];
  file(path: string): Blob;
}

/**
 * Allow serving over HTTPS on localhost, by load the TLS key and certificate for localhost from the files
 * `localhost-key.pem` and `localhost-cert.pem` in the current working directory.
 *
 * Example usage:
 * ```ts
 * Bun.serve({
 *   ...await loadKeyAndCert(),
 * })
 * ```
 *
 * The easiest way to generate those files is using mkcert.
 *
 * @returns options that can be added to the `Bun.serve` options
 */
export async function loadKeyAndCert(): Promise<KeyAndCert | undefined> {
  const { Bun } = globalThis as typeof globalThis & { Bun: Bun };

  if (Bun.argv.includes("--http")) {
    return;
  }

  try {
    return {
      key: await Bun.file(KEY_FILE).text(),
      cert: await Bun.file(CERT_FILE).text(),
    };
  } catch (error: unknown) {
    // deno-lint-ignore no-explicit-any
    if ((error as any)?.code !== "ENOENT") {
      throw error;
    }
  }
}
