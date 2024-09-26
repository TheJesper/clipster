"use strict";
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
// This function is called when the extension is activated
const activate = (context) => {
    // Function to display the relative folder structure with emojis
    const getFolderStructureWithEmojis = (folderUri) => {
        const buildStructure = (dir, relativePath = "", indent = "📂 ") => {
            let structure = `${indent}${path.basename(dir)}\n`;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);
                const relativeEntryPath = path.join(relativePath, entry.name);
                if (entry.isDirectory()) {
                    structure += buildStructure(entryPath, relativeEntryPath, `${indent}┣ 📂 `);
                }
                else {
                    structure += `${indent}┣ 📄 ${entry.name}\n`;
                }
            }
            return structure;
        };
        return buildStructure(folderUri.fsPath);
    };
    // Command to copy folder structure with relative paths and emojis
    let copyFolderStructure = vscode.commands.registerCommand("extension.copyFolderStructure", async (folderUri) => {
        const fullPath = folderUri.fsPath;
        const relativeStructure = getFolderStructureWithEmojis(folderUri);
        const formattedContent = `📂 Full Path: ${fullPath}\n\n${relativeStructure}`;
        vscode.env.clipboard.writeText(formattedContent);
        vscode.window.showInformationMessage("Folder structure copied with emojis.");
    });
    // Command to copy folder structure and file content with emojis
    let copyFolderStructureAndContent = vscode.commands.registerCommand("extension.copyFolderStructureAndContent", async (folderUri) => {
        const buildStructureWithContent = (dir, relativePath = "", indent = "📂 ") => {
            let structure = `${indent}${path.basename(dir)}\n`;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const entryPath = path.join(dir, entry.name);
                const relativeEntryPath = path.join(relativePath, entry.name);
                if (entry.isDirectory()) {
                    structure += buildStructureWithContent(entryPath, relativeEntryPath, `${indent}┣ 📂 `);
                }
                else {
                    const fileContent = fs.readFileSync(entryPath, "utf8");
                    structure += `${indent}┣ 📄 ${entry.name}\nContent:\n${fileContent}\n\n`;
                }
            }
            return structure;
        };
        const fullPath = folderUri.fsPath;
        const fullStructureWithContent = buildStructureWithContent(folderUri);
        const formattedContent = `📂 Full Path: ${fullPath}\n\n${fullStructureWithContent}`;
        vscode.env.clipboard.writeText(formattedContent);
        vscode.window.showInformationMessage("Folder structure and content copied with emojis.");
    });
    // Add to context subscriptions
    context.subscriptions.push(copyFolderStructure, copyFolderStructureAndContent);
};
// This function is called when the extension is deactivated
const deactivate = () => { };
module.exports = {
    activate,
    deactivate,
};
//# sourceMappingURL=extension.js.map