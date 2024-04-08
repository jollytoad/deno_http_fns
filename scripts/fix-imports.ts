import { walk } from "jsr:@std/fs@^0.221.0/walk";

export async function fixStdLibImports(root: string) {
  for await (const entry of walk(root, { exts: [".ts"] })) {
    const content = await Deno.readTextFile(entry.path);

    const replaced = content.replaceAll(/"@http\/([^"]+)"/g, (str) => {
      return str.replaceAll("_", "-");
    });

    if (replaced !== content) {
      console.log(entry.path);
      await Deno.writeTextFile(entry.path, replaced);
    }
  }
}

if (import.meta.main) {
  await fixStdLibImports(Deno.cwd());
}
