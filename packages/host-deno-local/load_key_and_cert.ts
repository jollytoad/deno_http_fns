const KEY_FILE = "localhost-key.pem";
const CERT_FILE = "localhost-cert.pem";

/**
 * @deprecated use Deno.TlsCertifiedKeyPem instead
 */
export type KeyAndCert = Deno.TlsCertifiedKeyPem;

/**
 * Allow serving over HTTPS on localhost, by load the TLS key and certificate for localhost from the files
 * `localhost-key.pem` and `localhost-cert.pem` in the current working directory.
 *
 * Example usage:
 * ```ts
 * Deno.serve({
 *   ...await loadKeyAndCert(),
 * })
 * ```
 *
 * The easiest way to generate those files is using mkcert.
 *
 * @returns options that can be added to the `Deno.serve` options
 */
export async function loadKeyAndCert(): Promise<
  Deno.TlsCertifiedKeyPem | undefined
> {
  if (Deno.args.includes("--http")) {
    return;
  }

  try {
    return {
      key: await Deno.readTextFile(KEY_FILE),
      cert: await Deno.readTextFile(CERT_FILE),
    };
  } catch (error: unknown) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
}
