// src/fileHelpers.ts
import fs from "fs";
import path from "path";
import os from "os";
import * as vscode from "vscode";
import logger from "./logger";
import { filterIgnoredFiles } from "./ignoreHelper";
import { readFileContent } from "./fileUtils";
import { showErrorMessage, showInformationMessage, showWarningMessage } from "./messageUtils";
import { traverseDirectory } from "./directoryUtils";
import { formatRootFolder } from "./structureFormatter";
import { getBaseDirectory, resolveTargetPath } from "./pathUtils";

export const isFolder = (filePath: string): boolean => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    logger.error(
      `Error determining if folder: ${filePath} - ${(err as Error).message}`,
      "fileHelpers",
      __filename
    );
    return false;
  }
};

export const copyRootFolderPath = (): string => {
  if (!vscode.workspace.workspaceFolders?.length) {
    vscode.window.showErrorMessage("No workspace folder open");
    return "";
  }
  return vscode.workspace.workspaceFolders[0].uri.fsPath;
};

export const getFolderStructure = (
  dir: string,
  additionalIgnores: string[] = []
): string => {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspaceRoot) {
    logger.error("No workspace root found", "fileHelpers", __filename);
    return "No workspace open";
  }

  const absolutePath = path.resolve(dir);
  const folderName = path.basename(dir);
  let structure = formatRootFolder(path.basename(workspaceRoot), absolutePath);
  structure += `${folderName}/${os.EOL}`;
  structure += traverseDirectory(dir, workspaceRoot, additionalIgnores);
  return structure;
};

export const copyRootFolderStructure = (
  additionalIgnores: string[] = []
): string => {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspaceRoot) {
    logger.error("No workspace root found", "fileHelpers", __filename);
    return "No workspace root found.";
  }
  return getFolderStructure(workspaceRoot, additionalIgnores);
};

export const copyRootFolderStructureAndContent = (
  additionalIgnores: string[] = []
): string => {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (!workspaceRoot) {
    logger.error("No workspace root found", "fileHelpers", __filename);
    return "No workspace root found.";
  }

  // Fix: use short keys — config is already scoped to "clipster"
  const config = vscode.workspace.getConfiguration("clipster");
  const maxFiles = config.get<number>("maxRootFiles", 10);
  const maxSizeKB = config.get<number>("maxRootSizeKB", 500);

  let totalSize = 0;
  let fileCount = 0;
  let content = getFolderStructure(workspaceRoot, additionalIgnores);

  const appendFileContents = (currentDir: string): void => {
    if (fileCount >= maxFiles || totalSize >= maxSizeKB * 1024) {
      return;
    }

    let rawEntries: fs.Dirent[];
    try {
      rawEntries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    const entries = filterIgnoredFiles(
      currentDir,
      rawEntries.map((e) => e.name),
      workspaceRoot,
      additionalIgnores
    );

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry);
      let stats: fs.Stats;
      try {
        stats = fs.statSync(entryPath);
      } catch (err) {
        logger.error(
          `Failed to stat: ${entryPath} - ${(err as Error).message}`,
          "fileHelpers",
          __filename
        );
        continue;
      }

      if (stats.isFile()) {
        if (
          totalSize + stats.size > maxSizeKB * 1024 ||
          fileCount >= maxFiles
        ) {
          vscode.window.showWarningMessage(
            `Reached limit: ${fileCount} files or ${maxSizeKB} KB total`
          );
          break;
        }
        const fileContent = readFileContent(entryPath);
        content += `${os.EOL}${os.EOL}File: ${entryPath}${os.EOL}${fileContent}`;
        totalSize += stats.size;
        fileCount++;
      } else if (stats.isDirectory()) {
        appendFileContents(entryPath);
      }

      if (fileCount >= maxFiles || totalSize >= maxSizeKB * 1024) {
        break;
      }
    }
  };

  appendFileContents(workspaceRoot);
  return content;
};

export const isValidPath = (filePath: string): boolean => {
  const baseName = path.basename(filePath);
  const invalidChars =
    process.platform === "win32"
      ? /[<>:"/\\|?*\x00-\x1F]/g
      : /[/\x00]/g;
  return !invalidChars.test(baseName);
};

export const createFileOrFolderFromClipboard = async (
  clipboardContent: string,
  uri: vscode.Uri
): Promise<void> => {
  logger.log(
    `Processing clipboard content: ${clipboardContent}`,
    "createFileOrFolderFromClipboard",
    __filename
  );

  const lines = clipboardContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (!lines.length) {
    showErrorMessage("Clipboard is empty or contains only whitespace.");
    logger.error(
      "Clipboard is empty or contains only whitespace.",
      "createFileOrFolderFromClipboard",
      __filename
    );
    return;
  }

  const baseDir = getBaseDirectory(uri);
  if (!baseDir) {
    showErrorMessage("Unable to determine the base directory.");
    logger.error(
      "Unable to determine the base directory.",
      "createFileOrFolderFromClipboard",
      __filename
    );
    return;
  }

  let filesCreated = 0;
  let foldersCreated = 0;
  let errorsOccurred = 0;

  for (const line of lines) {
    if (!isValidPath(line)) {
      logger.warn(
        `Skipped invalid path: ${line}`,
        "createFileOrFolderFromClipboard",
        __filename
      );
      errorsOccurred++;
      continue;
    }

    const targetPath = resolveTargetPath(line, baseDir);
    if (!targetPath) {
      errorsOccurred++;
      continue;
    }

    try {
      const isDirectory = line.endsWith("/") || line.endsWith("\\");
      if (isDirectory) {
        fs.mkdirSync(targetPath, { recursive: true });
        foldersCreated++;
        logger.log(
          `Created folder: ${targetPath}`,
          "createFileOrFolderFromClipboard",
          __filename
        );
      } else {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, "");
        filesCreated++;
        logger.log(
          `Created file: ${targetPath}`,
          "createFileOrFolderFromClipboard",
          __filename
        );
      }
    } catch (err) {
      logger.error(
        `Error creating path: ${targetPath} - ${(err as Error).message}`,
        "createFileOrFolderFromClipboard",
        __filename
      );
      errorsOccurred++;
    }
  }

  let summary = `Created ${filesCreated} file(s) and ${foldersCreated} folder(s).`;
  if (errorsOccurred > 0) {
    summary += ` ${errorsOccurred} item(s) skipped (invalid or failed).`;
    showWarningMessage(summary);
  } else {
    showInformationMessage(summary);
  }
  logger.log(summary, "createFileOrFolderFromClipboard", __filename);
};

export const copyFileContentWithPath = async (
  uris: vscode.Uri[]
): Promise<void> => {
  const content = uris
    .map((uri) => {
      const filePath = uri.fsPath;
      const fileContent = readFileContent(filePath);
      return `File: ${filePath}${os.EOL}${fileContent}`;
    })
    .join(`${os.EOL}${os.EOL}`);

  try {
    await vscode.env.clipboard.writeText(content);
    vscode.window.showInformationMessage(
      `${uris.length} file(s) copied with paths.`
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Failed to copy files: ${(err as Error).message}`
    );
    logger.error(
      `Failed to copy files: ${(err as Error).message}`,
      "fileHelpers",
      __filename
    );
  }
};

/**
 * Retrieves folder structure and file contents recursively.
 * workspaceRoot is threaded through all recursive calls so that the
 * ignore filter always computes paths relative to the actual workspace root.
 */
export const getFolderStructureAndContent = (
  dir: string,
  additionalIgnores: string[] = [],
  workspaceRoot?: string,
  indent = "┣ "
): string => {
  if (!dir || typeof dir !== "string") {
    logger.error(
      `Invalid directory path received: ${JSON.stringify(dir)}`,
      "getFolderStructureAndContent",
      __filename
    );
    throw new Error(`Invalid directory path: ${JSON.stringify(dir)}`);
  }

  // Establish workspaceRoot on the first (top-level) call
  const root =
    workspaceRoot ??
    vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath ??
    dir;

  logger.log(
    `Scanning folder: ${dir}`,
    "getFolderStructureAndContent",
    __filename
  );

  let structure = `${path.basename(dir)}\n`;
  let rawEntries: fs.Dirent[];

  try {
    rawEntries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    logger.error(
      `Unable to read directory: ${dir} - ${(err as Error).message}`,
      "getFolderStructureAndContent",
      __filename
    );
    return `Failed to read directory: ${dir}`;
  }

  const entries = filterIgnoredFiles(
    dir,
    rawEntries.map((e) => e.name),
    root,
    additionalIgnores
  );

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    let stats: fs.Stats;
    try {
      stats = fs.statSync(entryPath);
    } catch (err) {
      logger.error(
        `Failed to stat: ${entryPath} - ${(err as Error).message}`,
        "getFolderStructureAndContent",
        __filename
      );
      continue;
    }

    if (stats.isDirectory()) {
      // Pass the same root down — fixes the bug where dir was used as root
      structure += getFolderStructureAndContent(
        entryPath,
        additionalIgnores,
        root,
        `${indent}┃ `
      );
    } else {
      try {
        const fileContent = fs.readFileSync(entryPath, "utf8");
        structure += `${indent}${entry}\nContent:\n${fileContent}\n\n`;
      } catch (err) {
        logger.error(
          `Failed to read file: ${entryPath} - ${(err as Error).message}`,
          "getFolderStructureAndContent",
          __filename
        );
      }
    }
  }

  return structure;
};
