# Clipster 📁

A VS Code extension to copy file paths, folder structures, and contents from the file explorer to the clipboard — perfect for sharing with ChatGPT, Gemini, Perplexity, Claude, or even real humans.

## Features

### Create

- **📋 Create File or Folder from Clipboard** — Creates one or multiple files or folders based on the paths in your clipboard.

### Copy Structure

- **📁 Copy Folder Structure** — Copies the folder structure without file contents.
- **📁 Copy Folder Structure and Content** — Copies the folder structure along with all file contents.
- **📄 Copy File(s) Content with Path** — Copies the file content with its full path as a header.

### Copy Root

- **🏠 Copy Root Folder Path** — Copies the workspace root folder path.
- **🏠 Copy Root Folder Structure** — Copies the root folder structure without file contents.
- **🏠 Copy Root Folder Structure and Content** — Copies the root folder structure with file contents (respects size/file limits).

### Copy & Paste Files

- **📄 Copy File(s)** — Copies a file path to the clipboard for pasting into another folder.
- **📋 Paste File(s)** — Pastes a previously copied file into the selected folder.

## Usage

1. **Right-click** on any file or folder in the VS Code explorer.
2. **Select** an option from the **Clipster 📁** submenu.

### Creating Files or Folders from Clipboard

1. Copy file/folder paths to your clipboard (one per line).
2. Right-click a directory in the VS Code explorer.
3. Select **📋 Create File or Folder from Clipboard**.
4. Confirm when prompted (for multi-line content).

Paths ending in `/` or `\` are created as folders. Everything else is created as a file. Paths are relative to the directory you right-clicked.

### Copying Folder Structures

Right-click any folder and choose a copy option. The output uses Unicode tree characters:

```
🖥️ clipster
Path: c:\projects\clipster
┣ 📁 src/
┃ ┣ 📁 utils/
┃ ┃ ┗ 📄 helper.ts
┃ ┗ 📄 extension.ts
┣ 📁 resources/
┃ ┗ 📄 icon.png
┗ 📄 README.md
```

The tree output respects `.gitignore` patterns and your custom ignore settings.

## Settings

Customize Clipster via **File > Preferences > Settings** and search for "Clipster".

### Appearance

| Setting | Default | Description |
|---------|---------|-------------|
| `clipster.showEmojis` | `true` | Show emoji icons (📁 📄 🖥️) in tree output and menus. Requires reload. |
| `clipster.showInClipsterSubmenu` | `true` | Show commands in a submenu or directly in the context menu. |

### Command Visibility

Toggle individual commands on or off in the context menu:

| Setting | Default | Command |
|---------|---------|---------|
| `clipster.showCreateFileFromClipboard` | `true` | Create File or Folder from Clipboard |
| `clipster.showCopyFolderStructure` | `true` | Copy Folder Structure |
| `clipster.showCopyFolderStructureAndContent` | `true` | Copy Folder Structure and Content |
| `clipster.showCopyFileContentWithHeader` | `true` | Copy File(s) Content with Path |
| `clipster.showCopyFileContents` | `true` | Copy File Contents (no path) |
| `clipster.showCopyRootFolderPath` | `true` | Copy Root Folder Path |
| `clipster.showCopyRootFolderStructure` | `true` | Copy Root Folder Structure |
| `clipster.showCopyRootFolderStructureAndContent` | `true` | Copy Root Folder Structure and Content |
| `clipster.showCopyFile` | `true` | Copy File(s) |
| `clipster.showPasteFile` | `true` | Paste File(s) |

### Limits & Filtering

| Setting | Default | Description |
|---------|---------|-------------|
| `clipster.maxRootFiles` | `10` | Maximum number of files to include when copying root folder content. |
| `clipster.maxRootSizeKB` | `500` | Maximum total size (KB) when copying root folder content. |
| `clipster.additionalIgnores` | `[]` | Custom glob patterns to ignore (in addition to `.gitignore`). |

## Ignoring Files

Clipster automatically respects `.gitignore` patterns when copying folder structures. Add custom patterns via the `clipster.additionalIgnores` setting:

```json
"clipster.additionalIgnores": [
  "*.log",
  "dist/**",
  "coverage/**"
]
```

## Installation

**From VS Code Marketplace:**
Search for "Clipster" in the Extensions panel.

**From source:**
```bash
npm install
npm run build
npm run install-extension
```

Or use the interactive dev menu:
```bash
npm run menu
```

## Development

| Script | Description |
|--------|-------------|
| `npm run menu` | Interactive dev menu with all commands |
| `npm test` | Run Jest tests with coverage |
| `npm run test:quick` | Run only changed tests |
| `npm run build` | TypeScript check + production webpack build |
| `npm run type-check` | TypeScript compiler check only |
| `npm run install-extension` | Package VSIX and install locally |
| `npm run clean-build-install` | Full clean + version bump + build + install |

## License

This project is licensed under the MIT License.
