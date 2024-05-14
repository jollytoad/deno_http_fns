export function displayHost(hostname: string): string {
  if (hostname === "::" || hostname === "0.0.0.0") {
    return "localhost";
  }
  return hostname;
}

export function getServerProtocol(options: unknown): string {
  return hasKeyAndCert(options) ? "https" : "http";
}

export function getServerUrl(
  hostname: string,
  port: number,
  options: unknown,
): string {
  return `${getServerProtocol(options)}://${displayHost(hostname)}:${port}`;
}

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
