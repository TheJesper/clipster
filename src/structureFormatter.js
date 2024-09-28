const os = require("os");

// Helper to format folder and file structure with icons and appropriate lines
const formatStructure = (name, type, indent, isLast, hasChildren) => {
  const folderIcon = "📂";
  const fileIcon = "📄";
  const icon = type === "folder" ? folderIcon : fileIcon;

  // Handle line prefixes
  const linePrefix = isLast ? "┗ " : "┣ ";
  const childIndent = isLast ? "  " : "┃ ";

  // Return formatted string
  return `${indent}${linePrefix}${icon} ${name}${os.EOL}${
    hasChildren ? `${indent}${childIndent}` : ""
  }`;
};

// Function to format the root folder structure header with absolute path
const formatRootFolder = (name, path) => {
  const boxIcon = "📦";
  const computerIcon = "🖥️";

  return `${boxIcon} ${name}${os.EOL}${computerIcon}\u00A0${path}${os.EOL}\u00A0${os.EOL}`;
};

// Export the formatting functions
module.exports = {
  formatStructure,
  formatRootFolder,
};
