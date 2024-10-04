import os from "os";

// Helper to format folder and file structure with icons and appropriate lines
export const formatStructure = (name, type, indent, isLast, hasChildren) => {
  const folderIcon = "📂";
  const fileIcon = "📄";
  const icon = type === "folder" ? folderIcon : fileIcon;

  // Handle line prefixes for consistency within the same folder level
  const linePrefix = isLast ? "┗ " : "┣ ";
  const childIndent = isLast ? "  " : "┃ ";

  // Return formatted string ensuring proper alignment without extra spaces
  return `${indent}${linePrefix}${icon} ${name}${os.EOL}${
    hasChildren ? "" : ""
  }`;
};

// Function to format the root folder structure header with absolute path
export const formatRootFolder = (name, path) => {
  const boxIcon = "📦";
  const computerIcon = "🖥️";

  return `${boxIcon} ${name}${os.EOL}${computerIcon} ${path}${os.EOL}`;
};
