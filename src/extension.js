const { commands, window, workspace, env, Uri } = require("vscode");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);

// Helper function to copy to clipboard
const copyToClipboard = async (text, successMessage, errorMessage) => {
  try {
    await env.clipboard.writeText(text);
    window.showInformationMessage(successMessage);
  } catch (error) {
    window.showErrorMessage(errorMessage);
  }
};

// Helper function to get .gitignore rules
const shouldIgnoreFile = (filePath, gitignore) => {
  const ignoredFolders = ["node_modules", "dist", ".git", "coverage"];
  return (
    ignoredFolders.some((folder) => filePath.includes(folder)) ||
    gitignore.ignores(filePath)
  );
};

// Function to get folder structure (no content)
const getFolderStructure = async (folderPath, gitignore) => {
  const structure = [];
  const entries = await readdirAsync(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (!shouldIgnoreFile(fullPath, gitignore)) {
      if (entry.isDirectory()) {
        structure.push(fullPath + "/");
        const subStructure = await getFolderStructure(fullPath, gitignore);
        structure.push(...subStructure);
      } else {
        structure.push(fullPath);
      }
    }
  }
  return structure;
};

// Function to get folder structure with file contents
const getFolderStructureAndContent = async (folderPath, gitignore) => {
  const structureWithContent = [];
  const entries = await readdirAsync(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (!shouldIgnoreFile(fullPath, gitignore)) {
      if (entry.isDirectory()) {
        structureWithContent.push(fullPath + "/");
        const subStructure = await getFolderStructureAndContent(
          fullPath,
          gitignore
        );
        structureWithContent.push(...subStructure);
      } else {
        const content = await readFileAsync(fullPath, "utf8");
        structureWithContent.push({ path: fullPath, content });
      }
    }
  }
  return structureWithContent;
};

// Copy file content and path command
const copyFileContentWithPath = async (uri) => {
  try {
    const filePath = uri.fsPath;
    const content = await readFileAsync(filePath, "utf8");
    const text = `📁 Path: ${filePath}\n📝 Content:\n${content}`;
    await copyToClipboard(
      text,
      "📁 Path and content copied to clipboard!",
      "❌ Failed to copy file content."
    );
  } catch (error) {
    window.showErrorMessage("❌ Failed to read file content.");
  }
};

// Copy folder structure command
const copyFolderStructure = async (uri) => {
  try {
    const folderPath = uri.fsPath;
    const gitignore = workspace.getConfiguration("gitignore");
    const structure = await getFolderStructure(folderPath, gitignore);
    const text = structure.join("\n");
    await copyToClipboard(
      text,
      "📁 Folder structure copied!",
      "❌ Failed to copy folder structure."
    );
  } catch (error) {
    window.showErrorMessage("❌ Failed to copy folder structure.");
  }
};

// Copy folder structure and content command
const copyFolderStructureAndContent = async (uri) => {
  try {
    const folderPath = uri.fsPath;
    const gitignore = workspace.getConfiguration("gitignore");
    const structureWithContent = await getFolderStructureAndContent(
      folderPath,
      gitignore
    );
    const text = structureWithContent
      .map((item) => (item.content ? `${item.path}\n${item.content}` : item))
      .join("\n\n");
    await copyToClipboard(
      text,
      "📁 Folder structure and content copied!",
      "❌ Failed to copy folder structure with content."
    );
  } catch (error) {
    window.showErrorMessage("❌ Failed to copy folder structure and content.");
  }
};

// Copy root folder path command
const copyRootFolderPath = async () => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (rootPath) {
    await copyToClipboard(
      rootPath,
      "📁 Root folder path copied to clipboard!",
      "❌ Failed to copy root folder path."
    );
  } else {
    window.showErrorMessage("❌ No root folder found.");
  }
};

// Activate function to register commands
const activate = (context) => {
  context.subscriptions.push(
    commands.registerCommand(
      "clipster.copyFileContentWithHeader",
      copyFileContentWithPath
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "clipster.copyFolderStructure",
      copyFolderStructure
    )
  );
  context.subscriptions.push(
    commands.registerCommand(
      "clipster.copyFolderStructureAndContent",
      copyFolderStructureAndContent
    )
  );
  context.subscriptions.push(
    commands.registerCommand("clipster.copyRootFolderPath", copyRootFolderPath)
  );
};

// Deactivate function
const deactivate = () => {};

module.exports = { activate, deactivate };
