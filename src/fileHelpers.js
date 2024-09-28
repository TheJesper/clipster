// src/fileHelpers.js
const fs = require("fs");
const path = require("path");
const { workspace, window } = require("vscode");
const ignore = require("ignore");

// Helper to filter ignored files using the ignore package
const filterIgnoredFiles = (dir, files) => {
  const ignoreFilePath = path.join(dir, ".gitignore");
  if (fs.existsSync(ignoreFilePath)) {
    const ignoreRules = fs.readFileSync(ignoreFilePath, "utf8");
    const ig = ignore().add(ignoreRules);
    return ig.filter(files);
  }
  return files;
};

// Function to get folder structure (without content)
const getFolderStructure = (dir, indent = "📂 ") => {
  let structure = `${indent}${path.basename(dir)}\n`;
  let entries = fs.readdirSync(dir, { withFileTypes: true });

  entries = filterIgnoredFiles(
    dir,
    entries.map((e) => e.name)
  );

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory()) {
      structure += getFolderStructure(entryPath, `${indent} ┣ 📂 `);
    } else {
      structure += `${indent} ┣ 📄 ${entry}\n`;
    }
  }
  return structure;
};

// Function to get folder structure with content
const getFolderStructureAndContent = (dir, indent = "📂 ") => {
  let structure = `${indent}${path.basename(dir)}\n`;
  let entries = fs.readdirSync(dir, { withFileTypes: true });

  entries = filterIgnoredFiles(
    dir,
    entries.map((e) => e.name)
  );

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stat = fs.statSync(entryPath);
    if (stat.isDirectory()) {
      structure += getFolderStructureAndContent(entryPath, `${indent} ┣ 📂 `);
    } else {
      const content = fs.readFileSync(entryPath, "utf8");
      structure += `${indent} ┣ 📄 ${entry}\nContent:\n${content}\n\n`;
    }
  }
  return structure;
};

// Copy root folder path command with added logging
const copyRootFolderPath = () => {
  try {
    window.showInformationMessage("Attempting to copy root folder path...");

    const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;

    if (rootPath) {
      window.showInformationMessage(`Root folder found: ${rootPath}`);
      return `📁 Root Path: ${rootPath}`;
    } else {
      throw new Error("No root folder found.");
    }
  } catch (error) {
    window.showErrorMessage(
      `Failed to copy root folder path: ${error.message}`
    );
    throw error;
  }
};

module.exports = {
  copyRootFolderPath,
};

// Copy root folder structure command
const copyRootFolderStructure = () => {
  try {
    const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (rootPath) {
      const structure = getFolderStructure(rootPath);
      return structure;
    } else {
      throw new Error("No root folder found.");
    }
  } catch (error) {
    window.showErrorMessage(
      `Failed to copy root folder structure: ${error.message}`
    );
    throw error;
  }
};

module.exports = {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
};
