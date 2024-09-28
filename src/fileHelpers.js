const fs = require("fs");
const path = require("path");
const os = require("os"); // Make sure os is imported here
const ignore = require("ignore");
const { workspace } = require("vscode");
const { formatStructure, formatRootFolder } = require("./structureFormatter");

// Helper to load and apply ignore rules using the ignore package
const filterIgnoredFiles = (dir, files, additionalIgnores) => {
  let ig = ignore();

  // Add ignore rules from .gitignore and .vscodeignore if present
  const gitIgnorePath = path.join(dir, ".gitignore");
  if (fs.existsSync(gitIgnorePath)) {
    const gitIgnoreRules = fs.readFileSync(gitIgnorePath, "utf8");
    ig = ig.add(gitIgnoreRules);
  }
  const vscodeIgnorePath = path.join(dir, ".vscodeignore");
  if (fs.existsSync(vscodeIgnorePath)) {
    const vscodeIgnoreRules = fs.readFileSync(vscodeIgnorePath, "utf8");
    ig = ig.add(vscodeIgnoreRules);
  }

  // Add custom additional ignores from settings
  if (additionalIgnores && additionalIgnores.length > 0) {
    ig = ig.add(additionalIgnores);
  }

  return files.filter((file) => !ig.ignores(file)); // Keep files that should not be ignored
};

// Traverse folder structure, display folders first, and sort alphabetically
const traverseDirectory = (
  dir,
  additionalIgnores = [],
  indent = "",
  isLast = false
) => {
  let structure = "";

  // Get entries and apply filtering
  let entries = fs.readdirSync(dir, { withFileTypes: true });
  entries = filterIgnoredFiles(
    dir,
    entries.map((e) => e.name),
    additionalIgnores
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
const getFolderStructure = (dir, additionalIgnores = []) => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  const absolutePath = path.resolve(dir);
  const folderName = path.basename(dir);

  // Format the root folder with absolute path and name of the current folder
  let structure = formatRootFolder(path.basename(rootPath), absolutePath);
  structure += `📂 ${folderName}${os.EOL}`; // Include folder name
  structure += traverseDirectory(dir, additionalIgnores);
  return structure;
};

// Function to copy the root folder path
const copyRootFolderPath = () => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (rootPath) {
    return rootPath; // Return the root folder path
  }
  return null;
};

// Function to get root folder structure
const copyRootFolderStructure = (additionalIgnores = []) => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  return getFolderStructure(rootPath, additionalIgnores);
};

// Export the functions
module.exports = {
  getFolderStructure,
  copyRootFolderPath,
  copyRootFolderStructure,
};
