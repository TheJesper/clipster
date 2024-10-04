// File: src/ignoreHelper.js
// Version: 2.1.1

import path from "path";
import fs from "fs";
import ignore from "ignore";

// Function to filter ignored files using the ignore library
export const filterIgnoredFiles = (
  dir,
  files,
  workspaceRoot,
  additionalIgnores = []
) => {
  const ignoreFilePath = path.join(workspaceRoot, ".gitignore");

  let ignorePatterns = additionalIgnores;
  if (fs.existsSync(ignoreFilePath)) {
    const gitignoreContent = fs.readFileSync(ignoreFilePath, "utf-8");
    ignorePatterns = ignorePatterns.concat(
      gitignoreContent.split("\n").map((line) => line.trim())
    );
  }

  const ig = ignore().add(ignorePatterns);

  return files.filter((file) => {
    const absoluteFilePath = path.resolve(dir, file);
    let relativePath = path.relative(workspaceRoot, absoluteFilePath);
    relativePath = path.posix.normalize(relativePath.replace(/\\/g, "/"));

    // Ensure trailing slash for directories
    const isDir = fs.statSync(absoluteFilePath).isDirectory();
    if (isDir && !relativePath.endsWith("/")) {
      relativePath += "/";
    }

    const isIgnored = ig.ignores(relativePath);
    return !isIgnored;
  });
};

// Optionally, expose a method to show the output channel when needed
export const showClipsterLogger = () => {
  // Placeholder for future logging functionality
};
