const fs = require("fs");
const path = require("path");

const { workspace, window } = require("vscode");

// Function to get folder structure (without content)
const getFolderStructure = (dir, indent = "📂 ") => {
  let structure = `${indent}${path.basename(dir)}\n`;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      structure += getFolderStructure(entryPath, `${indent}┣ 📂 `);
    } else {
      structure += `${indent}┣ 📄 ${entry.name}\n`;
    }
  }
  return structure;
};

// Function to get folder structure with content
const getFolderStructureAndContent = (dir, indent = "📂 ") => {
  let structure = `${indent}${path.basename(dir)}\n`;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      structure += getFolderStructureAndContent(entryPath, `${indent}┣ 📂 `);
    } else {
      const content = fs.readFileSync(entryPath, "utf8");
      structure += `${indent}┣ 📄 ${entry.name}\nContent:\n${content}\n\n`;
    }
  }
  return structure;
};

// Copy root folder path command
const copyRootFolderPath = () => {
  try {
    const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (rootPath) {
      window.showInformationMessage(
        `📁 Root Path: ${rootPath} copied successfully!`
      );
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

// Copy root folder structure command
const copyRootFolderStructure = () => {
  try {
    const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
    if (rootPath) {
      const structure = getFolderStructure(rootPath);
      window.showInformationMessage(
        "📁 Root folder structure copied successfully!"
      );
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
