// src/clipboardHelper.js
import * as vscode from "vscode";

export const copyToClipboard = async (
  text,
  successMessage = "📁 Copied to clipboard!",
  errorMessage = "Failed to copy to clipboard."
) => {
  try {
    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage(successMessage);
  } catch (error) {
    vscode.window.showErrorMessage(errorMessage);
  }
};
