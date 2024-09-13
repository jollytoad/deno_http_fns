import { dirname } from "@std/path/posix/dirname";
import { relative } from "@std/path/posix/relative";
import { fromFileUrl } from "@std/path/posix/from-file-url";

export function relativeModuleResolver(
  moduleOutUrl: string | URL,
): (moduleSpecifier: string) => string {
  const outPath = dirname(fromFileUrl(moduleOutUrl));

  return (moduleSpecifier) => {
    if (moduleSpecifier.startsWith("file:")) {
      const modulePath = relative(outPath, fromFileUrl(moduleSpecifier));
      return modulePath[0] !== "." ? "./" + modulePath : modulePath;
    }
    return moduleSpecifier;
  };
}
