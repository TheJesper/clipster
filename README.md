# Clipster

A minimal VS Code extension to copy file paths, folder structures, and contents from file explorer to the clipboard so that it can be shared with ChatGPT, Gemini, Perplexity, or even real humans 😊. Feedback === ❤️

## Features

- 📁 **Copy Folder Structure**: Copies the folder structure without including file contents.
- 📁 **Copy Folder Structure and Content**: Copies the folder structure along with file contents.
- 📁 **Copy Root Folder Path**: Copies the path of the root folder.
- 📁 **Copy Root Folder Structure**: Copies the root folder's structure without file contents.
- 📝 **Copy File Content with Path**: Copies both the file's content and its full path to the clipboard.
- 📝 **Copy Root Folder Structure and Content**: Copies the root folder's structure along with all file contents.

## Usage

1. **Right-click** on any file or folder in the VS Code explorer.
2. **Select** one of the options from the **Clipster** menu.

The copied information will be available in your clipboard in a visually appealing format.

## Example

Here is an example of a copied folder structure:

```
📦 clipster
🖥️ c:\projects\clipster
┣ 📂 src
┃ ┣ 📂 utils
┃ ┃ ┗ 📄 helper.js
┃ ┗ 📄 main.js
┣ 📂 assets
┃ ┗ 📄 logo.png
┗ 📄 README.md
```

This feature helps you easily share the structure of your projects with others, humans or androids!

## Settings

You can customize Clipster's behavior through the following settings in the VS Code settings:

⚙️ **To access settings**: Go to **File > Preferences > Settings** (Windows/Linux) or **Code > Preferences > Settings** (macOS), then search for "Clipster".

- **Clipster: Show Copy File Content with Path** (`clipster.showCopyFileContentWithHeader`): Enable or disable copying file content with the path.
- **Clipster: Show Copy Folder Structure** (`clipster.showCopyFolderStructure`): Enable or disable copying the folder structure.
- **Clipster: Show Copy Folder Structure and Content** (`clipster.showCopyFolderStructureAndContent`): Enable or disable copying the folder structure along with content.
- **Clipster: Show Copy Root Folder Path** (`clipster.showCopyRootFolderPath`): Enable or disable copying the root folder path.
- **Clipster: Show Copy Root Folder Structure** (`clipster.showCopyRootFolderStructure`): Enable or disable copying the root folder structure.
- **Clipster: Show Copy Root Folder Structure and Content** (`clipster.showCopyRootFolderStructureAndContent`): Enable or disable copying the root folder structure along with content.
- **Clipster: Show in Clipster Submenu** (`clipster.showInClipsterSubmenu`): Show Clipster commands in a submenu or directly in the root menu.
- **Clipster: Additional Ignores** (`clipster.additionalIgnores`): Add custom file patterns to ignore when copying folder structures.

## Ignoring Files

Clipster respects `.gitignore` and `.vscodeignore` files when copying folder structures. You can also add custom ignore patterns using the **Clipster: Additional Ignores** setting to tailor the output to your needs.

## Installation

[GitHub Repository](https://github.com/TheJesper/clipster)

Search for Clipster in VS Code to install.

Run `npm run clean-build-install` to build and install the extension locally.

### Scripts Explained

- **test**: Runs the Mocha tests.
- **webpack**: Builds the project in development mode.
- **build**: Creates a production build using Webpack.
- **clean**: Removes the `OUT` directory.
- **bump-build**: Updates the version and builds the extension.
- **clean-build-install**: Cleans, builds, and installs the extension.
- **install-extension**: Installs the extension from the build output.
- **release**: Creates a new release version.

**Note**: The tests are currently not passing.

## License

This project is licensed under the MIT License.

**Disclaimer**: Due to frustration, all features might not be fully ready 😒. Please provide feedback to help us improve 🤙.
