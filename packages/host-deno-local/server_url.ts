/**
 * Display a friendly hostname.
 *
 * Converts the localhost IP (`::`/`0.0.0.0`) to the literal string `localhost`.
 */
export function displayHost(hostname: string): string {
  if (hostname === "::" || hostname === "0.0.0.0") {
    return "localhost";
  }
  return hostname;
}

/**
 * Determines whether the protocol of the server will be `http` or `https`
 * depending on the options given to the server.
 *
 * @param options the options to be passed to `Deno.serve`
 * @returns `http` or `https`
 */
export function getServerProtocol(options: unknown): string {
  return hasKeyAndCert(options) ? "https" : "http";
}

/**
 * Format a friendly base URL for the server.
 */
export function getServerUrl(
  hostname: string,
  port: number,
  options?: unknown,
): string {
  return `${getServerProtocol(options)}://${displayHost(hostname)}:${port}`;
}

/**
 * Log the friendly base URL for the server to the console.
 *
 * Useful for passing to the `onListen` option of `Deno.serve`.
 *
 * @param options the options to be passed to `Deno.serve`
 */
export function logServerUrl(
  options: unknown,
): (hostAndPort: HostAndPort) => void {
  return ({ hostname, port }: HostAndPort) => {
    console.log(getServerUrl(hostname, port, options));
  };
}

function hasKeyAndCert(options: unknown): options is KeyAndCert {
  return !!options && typeof options === "object" &&
    "key" in options && !!options.key && typeof options.key === "string" &&
    "cert" in options && !!options.cert && typeof options.cert === "string";
}

interface HostAndPort {
  hostname: string;
  port: number;
}

interface KeyAndCert {
  key: string;
  cert: string;
}
