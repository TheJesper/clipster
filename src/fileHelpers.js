// src/fileHelpers.js
import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { formatStructure, formatRootFolder } from "./structureFormatter.js";
import { filterIgnoredFiles } from "./ignoreHelper.js";
import os from "os";

// Traverse folder structure, display folders first, and sort alphabetically
const traverseDirectory = (
  dir,
  workspaceRoot,
  additionalIgnores = [],
  indent = "",
  isLast = false
) => {
  let structure = "";

  // Get entries and apply filtering
  let entries = fs.readdirSync(dir, { withFileTypes: true });

  // Filter files based on ignore patterns
  entries = filterIgnoredFiles(
    dir,
    entries.map((e) => e.name),
    workspaceRoot,
    additionalIgnores,
    fs,
    path
  );

  // Separate directories and files and sort them alphabetically
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

  // Log and show notification with root path
  const message = `💥 Root Path: ${workspaceRoot}`;
  console.log(message);
  vscode.window.showInformationMessage(message);

  // Format the root folder with absolute path and name of the current folder
  let structure = formatRootFolder(path.basename(workspaceRoot), absolutePath);
  structure += `📂 ${folderName}${os.EOL}`; // Include folder name
  structure += traverseDirectory(dir, workspaceRoot, additionalIgnores);
  return structure;
};

// Function to get folder structure and content (dummy example for now)
export const getFolderStructureAndContent = (dir, additionalIgnores = []) => {
  const folderStructure = getFolderStructure(dir, additionalIgnores);
  return folderStructure; // Modify logic as per requirement
};

// Function to copy file content with path (dummy example for now)
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
