// src/ignoreHelper.js
import path from "path";
import fs from "fs";
import picomatch from "picomatch";

/**
 * Helper to filter ignored files using relative paths and custom ignore rules.
 */
export const filterIgnoredFiles = (
  dir,
  files,
  workspaceRoot,
  ignorePatterns = [],
  fsModule = fs,
  pathModule = path
) => {
  const preparedPatterns = prepareIgnorePatterns(ignorePatterns);

  const filteredFiles = files.filter((file) => {
    const isDir = fsModule.statSync(pathModule.join(dir, file)).isDirectory();

    // Resolve the absolute path of the file.
    const absoluteFilePath = pathModule.resolve(dir, file.replace(/\/$/, ""));

    // Compute the relative path from 'workspaceRoot' to the file.
    let relativePath = pathModule.relative(workspaceRoot, absoluteFilePath);
    relativePath = relativePath.replace(/\\/g, "/");

    // Append '/' if it's a directory.
    if (isDir && !relativePath.endsWith("/")) {
      relativePath += "/";
    }

    // Ignore empty paths.
    if (!relativePath) {
      relativePath = ".";
    }

    // Check if the path is ignored.
    const isIgnored = isPathIgnored(relativePath, preparedPatterns);

    return !isIgnored;
  });

  return filteredFiles;
};

/**
 * Prepares the ignore patterns, handling negation and order.
 */
const prepareIgnorePatterns = (patterns) =>
  patterns.map((pattern) => {
    const isNegation = pattern.startsWith("!");
    const cleanPattern = isNegation ? pattern.slice(1) : pattern;
    const matcher = picomatch(cleanPattern, { dot: true });

    return {
      pattern: cleanPattern,
      matcher,
      isNegation,
    };
  });

/**
 * Checks if a given path is ignored based on the ignore patterns.
 */
const isPathIgnored = (relativePath, ignorePatterns) => {
  let ignored = false;

  for (const { matcher, isNegation } of ignorePatterns) {
    const matches = matcher(relativePath);

    if (matches) {
      ignored = !isNegation;
    }
  }

  return ignored;
};
