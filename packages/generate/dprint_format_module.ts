import {
  createStreaming,
  type Formatter,
  type GlobalConfiguration,
} from "@dprint/formatter";

export function dprintFormatModule(config: GlobalConfiguration = {
  lineWidth: 80,
  indentWidth: 2,
}): (url: string | URL, content: string) => Promise<string> {
  let tsFormatter: Promise<Formatter>;

  return async function formatModule(
    filePath: string | URL,
    fileText: string,
  ): Promise<string> {
    tsFormatter ??= loadFormatter(config);

    return (await tsFormatter).formatText({
      filePath: filePath.toString(),
      fileText,
    });
  };
}

async function loadFormatter(config?: GlobalConfiguration) {
  const formatter = await createStreaming(
    // check https://plugins.dprint.dev/ for latest plugin versions
    fetch("https://plugins.dprint.dev/typescript-0.91.6.wasm"),
  );

  if (config) {
    formatter.setConfig(config, {});
  }

  return formatter;
}
