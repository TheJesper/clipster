const fs = require("fs");
const path = require("path");
const ignore = require("ignore");
const { workspace } = require("vscode");

// Helper to filter ignored files using the ignore package
const filterIgnoredFiles = (dir, files, additionalIgnores) => {
  const ignoreFilePath = path.join(dir, ".gitignore");
  let ig = ignore();

  if (fs.existsSync(ignoreFilePath)) {
    const ignoreRules = fs.readFileSync(ignoreFilePath, "utf8");
    ig = ig.add(ignoreRules);
  }

  if (additionalIgnores && additionalIgnores.length > 0) {
    ig = ig.add(additionalIgnores);
  }

  return ig.filter(files);
};

// Function to get relative path if available, otherwise absolute path
const getRelativeOrAbsolutePath = (filePath) => {
  const workspaceFolder = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  if (workspaceFolder && filePath.startsWith(workspaceFolder)) {
    return path.relative(workspaceFolder, filePath);
  }
  return filePath;
};

// Helper to format the folder structure correctly
const formatStructure = (name, type, indent) => {
  if (type === "folder") {
    return `${indent}📂 ${name}\n`;
  } else {
    return `${indent}📄 ${name}\n`;
  }
};

// Traverse folder structure, display folders first, and sort alphabetically
const traverseDirectory = (dir, additionalIgnores = [], indent = "┣ ") => {
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
  for (const directory of directories) {
    structure += formatStructure(directory, "folder", indent);
    structure += traverseDirectory(
      path.join(dir, directory),
      additionalIgnores,
      `${indent}┃ `
    );
  }

  // Traverse files
  for (const file of files) {
    structure += formatStructure(file, "file", indent);
  }

  return structure;
};

// Function to get the folder structure
const getFolderStructure = (dir, additionalIgnores = []) => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  const rootFolderName = path.basename(rootPath);
  const relativeOrAbsolutePath = getRelativeOrAbsolutePath(dir);

  let structure = `📦 ${rootFolderName}\n 📂 ${relativeOrAbsolutePath}\n`;
  structure += traverseDirectory(dir, additionalIgnores);
  return structure;
};

// Function to get the folder structure and file contents
const getFolderStructureAndContent = (
  dir,
  additionalIgnores = [],
  indent = "┣ "
) => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  const rootFolderName = path.basename(rootPath);
  let structure = `📦 ${rootFolderName}\n`;

  const processDirectory = (dir, currentIndent) => {
    let entries = fs.readdirSync(dir, { withFileTypes: true });
    entries = filterIgnoredFiles(
      dir,
      entries.map((e) => e.name),
      additionalIgnores
    );

    // Sort and separate directories and files
    const directories = entries
      .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
      .sort();
    const files = entries
      .filter((entry) => fs.statSync(path.join(dir, entry)).isFile())
      .sort();

    // Process directories first
    for (const directory of directories) {
      structure += `${currentIndent}📂 ${directory}\n`;
      structure += processDirectory(
        path.join(dir, directory),
        `${currentIndent}┃ `
      );
    }

    // Process files with content
    for (const file of files) {
      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, "utf8");
      structure += `${currentIndent}📄 ${file}\nContent:\n${content}\n\n`;
    }
  };

  processDirectory(dir, indent);
  return structure;
};

// Function to copy the root folder path
const copyRootFolderPath = () => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  return `📦 ${path.basename(rootPath)}\nPath: ${rootPath}`;
};

// Function to copy the root folder structure
const copyRootFolderStructure = (additionalIgnores = []) => {
  const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
  const rootFolderName = path.basename(rootPath);

  let structure = `📦 ${rootFolderName}\n`;
  structure += traverseDirectory(rootPath, additionalIgnores);
  return structure;
};

// Export the functions
module.exports = {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
};
