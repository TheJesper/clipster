// File: src/fileHelpers.js
// Version: 2.1.1

import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { formatStructure, formatRootFolder } from "./structureFormatter.js";
import { filterIgnoredFiles } from "./ignoreHelper.js";
import os from "os";

// Function to traverse a directory, formatting its structure for display
const traverseDirectory = (
  dir,
  workspaceRoot,
  additionalIgnores = [],
  indent = "",
  isLast = false
) => {
  let structure = "";

  // Get directory entries and filter based on ignore patterns
  let entries = fs.readdirSync(dir, { withFileTypes: true });
  entries = filterIgnoredFiles(
    dir,
    entries.map((e) => e.name),
    workspaceRoot,
    additionalIgnores
  );

  // Separate and sort directories and files
  const directories = entries
    .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
    .sort();
  const files = entries
    .filter((entry) => fs.statSync(path.join(dir, entry)).isFile())
    .sort();

  // Traverse directories first
  directories.forEach((directory, index) => {
    const isLastDir = index === directories.length - 1 && files.length === 0;
    const hasChildren = fs.readdirSync(path.join(dir, directory)).length > 0;
    structure += formatStructure(
      directory,
      "folder",
      indent,
      isLastDir,
      hasChildren
    );
    structure += traverseDirectory(
      path.join(dir, directory),
      workspaceRoot,
      additionalIgnores,
      `${indent}${isLastDir ? "  " : "┃ "}`,
      isLastDir
    );
  });

  // Traverse files
  files.forEach((file, index) => {
    const isLastFile = index === files.length - 1;
    structure += formatStructure(file, "file", indent, isLastFile, false);
  });

  return structure;
};

// Function to get the folder structure
export const getFolderStructure = (dir, additionalIgnores = []) => {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  const absolutePath = path.resolve(dir);
  const folderName = path.basename(dir);

  // Format the root folder with absolute path and name of the current folder
  let structure = formatRootFolder(path.basename(workspaceRoot), absolutePath);
  structure += `📂 ${folderName}${os.EOL}`; // Include folder name
  structure += traverseDirectory(dir, workspaceRoot, additionalIgnores);
  return structure;
};

// Function to get folder structure and content
export const getFolderStructureAndContent = (dir, additionalIgnores = []) => {
  const folderStructure = getFolderStructure(dir, additionalIgnores);
  let content = folderStructure;

  // Append file contents below the folder structure
  const appendFileContents = (currentDir) => {
    let entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries = filterIgnoredFiles(
      currentDir,
      entries.map((e) => e.name),
      dir,
      additionalIgnores
    );

    entries.forEach((entry) => {
      const entryPath = path.join(currentDir, entry);
      if (fs.statSync(entryPath).isFile()) {
        const fileContent = fs.readFileSync(entryPath, "utf-8");
        content += `${os.EOL}${os.EOL}📄 ${entryPath}${os.EOL}${fileContent}`;
      } else if (fs.statSync(entryPath).isDirectory()) {
        appendFileContents(entryPath);
      }
    });
  };

  appendFileContents(dir);
  return content;
};

// Function to copy file content with path
export const copyFileContentWithPath = (uri) => {
  const filePath = uri.fsPath;
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return `${filePath}${os.EOL}${fileContent}`;
};

// Function to copy root folder path
export const copyRootFolderPath = () => {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  return workspaceRoot
    ? `📁 Root Path: ${workspaceRoot}`
    : "No workspace root found.";
};

// Function to copy root folder structure
export const copyRootFolderStructure = (additionalIgnores = []) => {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
  return workspaceRoot
    ? getFolderStructure(workspaceRoot, additionalIgnores)
    : "No workspace root found.";
};
