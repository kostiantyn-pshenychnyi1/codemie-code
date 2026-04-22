import { readFile } from "fs/promises";
import { basename } from "path";
import { lookup } from "mime-types";
import type { File } from "codemie-sdk";

/**
 * Read files from local paths and convert to SDK File format
 * @param filePaths Array of local file paths
 * @returns Array of File objects with content and metadata
 */
export async function readFilesFromPaths(
  filePaths: string[],
): Promise<File[]> {
  const files: File[] = [];

  for (const filePath of filePaths) {
    const content = await readFile(filePath);
    const name = basename(filePath);
    const mime_type = lookup(filePath) || "application/octet-stream";

    files.push({ name, content, mime_type });
  }

  return files;
}
