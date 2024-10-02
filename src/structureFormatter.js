// src/structureFormatter.js
import os from "os";

// Helper to format folder and file structure with icons and appropriate lines
export const formatStructure = (name, type, indent, isLast, hasChildren) => {
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
export const formatRootFolder = (name, path) => {
  const boxIcon = "📦";
  const computerIcon = "🖥️";

  return `${boxIcon} ${name}${os.EOL}${computerIcon}\u00A0${path}${os.EOL}\u00A0${os.EOL}`;
};
