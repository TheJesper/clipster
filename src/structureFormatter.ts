// src/structureFormatter.ts
import os from "os";
import * as vscode from "vscode";

function useEmojis(): boolean {
  return vscode.workspace
    .getConfiguration("clipster")
    .get<boolean>("showEmojis", true);
}

export const formatStructure = (
  name: string,
  type: "file" | "folder",
  indent: string,
  isLast: boolean
): string => {
  const linePrefix = isLast ? "┗ " : "┣ ";
  const icon = useEmojis() ? (type === "folder" ? "📁 " : "📄 ") : "";
  return `${indent}${linePrefix}${icon}${name}${os.EOL}`;
};

export const formatRootFolder = (name: string, folderPath: string): string => {
  const icon = useEmojis() ? "🖥️ " : "";
  return `${icon}${name}${os.EOL}Path: ${folderPath}${os.EOL}`;
};
