import path from "path";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { capitalizeName } from "./utils.js";
import type { SourceFile } from "./syntax/SourceFile.js";
import chalk from "chalk";
import { Logger } from "./Logger.js";

/**
 * Formats Rust source code using `rustfmt` if available.
 * Falls back to the original content if `rustfmt` is not installed or fails.
 */
async function formatRust(content: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = execFile(
      "rustfmt",
      ["--edition", "2021"],
      { timeout: 5000 },
      (error, stdout) => {
        if (error) {
          // rustfmt not available or failed — return unformatted
          resolve(content);
        } else {
          resolve(stdout);
        }
      },
    );
    proc.stdin?.write(content);
    proc.stdin?.end();
  });
}

/**
 * Writes the given file to disk and returns its actual path.
 */
export async function writeFile(
  basePath: string,
  file: SourceFile,
): Promise<string> {
  const filepath = path.join(basePath, ...file.subdirectory, file.name);
  const language = capitalizeName(file.language);
  Logger.debug(`          ${chalk.dim(language)}: Creating ${file.name}...`);

  const dir = path.dirname(filepath);
  // Create directory if it doesn't exist yet
  await fs.mkdir(dir, { recursive: true });

  // Format Rust files with rustfmt if available
  let content = file.content.trim() + "\n";
  if (file.language === "rust" && file.name.endsWith(".rs")) {
    content = await formatRust(content);
  }

  // Write file
  await fs.writeFile(filepath, content, "utf8");

  return filepath;
}
