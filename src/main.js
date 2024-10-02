// src/main.js

import { copyToClipboard } from "./clipboardHelper.js";
import {
  getFolderStructure,
  getFolderStructureAndContent,
  copyRootFolderPath,
  copyRootFolderStructure,
  copyFileContentWithPath,
} from "./fileHelpers.js";

// Example function to handle clipboard and folder structure logic
export const handleCopyFolderStructure = async (uri, additionalIgnores) => {
  try {
    const result = await getFolderStructure(uri.fsPath, additionalIgnores);
    await copyToClipboard(result, "📁 Folder structure copied successfully!");
  } catch (error) {
    console.error(`Error copying folder structure: ${error.message}`);
  }
};

// Function to handle copying folder structure and content
export const handleCopyFolderStructureAndContent = async (
  uri,
  additionalIgnores
) => {
  try {
    const result = await getFolderStructureAndContent(
      uri.fsPath,
      additionalIgnores
    );
    if (result) {
      await copyToClipboard(
        result,
        "📁 Folder structure and content copied successfully!"
      );
    } else {
      console.error("Failed to retrieve folder structure and content.");
    }
  } catch (error) {
    console.error(
      `Error copying folder structure and content: ${error.message}`
    );
  }
};

// Function to copy file content with path
export const handleCopyFileContentWithPath = async (uri) => {
  try {
    const result = await copyFileContentWithPath(uri);
    await copyToClipboard(
      result,
      "📝 File content with path copied successfully!"
    );
  } catch (error) {
    console.error(`Error copying file content: ${error.message}`);
  }
};

// Function to handle root folder path copying
export const handleCopyRootFolderPath = () => {
  const result = copyRootFolderPath();
  copyToClipboard(result, "📁 Root folder path copied successfully!");
};

// Function to handle root folder structure copying
export const handleCopyRootFolderStructure = (additionalIgnores) => {
  const result = copyRootFolderStructure(additionalIgnores);
  copyToClipboard(result, "📁 Root folder structure copied successfully!");
};
