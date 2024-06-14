import type { DirectoryEntry } from "./types.ts";

export function isDirectory(entry: DirectoryEntry): boolean {
  return typeof entry.isDirectory === "function"
    ? entry.isDirectory()
    : !!entry.isDirectory;
}

export function isFile(entry: DirectoryEntry): boolean {
  return typeof entry.isFile === "function" ? entry.isFile() : !!entry.isFile;
}
