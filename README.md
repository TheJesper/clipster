
# Clipster: Dirs & Files to Clipboard 🎉

**Clipster** is a fun and efficient Visual Studio Code extension that helps you copy file and folder structures to your clipboard, complete with emojis for added fun! Whether you're working with files or folders, Clipster is here to streamline your workflow.

## Features

- 📄 **Copy File Content with Path**: Copies the full path of a file to the clipboard along with its content.
- 📂 **Copy Folder Structure**: Copies the structure of the selected folder, including directories and files, while respecting `.gitignore` and a set of default ignored patterns (e.g., `node_modules`, `dist`, etc.).
- 📂📄 **Copy Folder Structure and Content**: Copies the folder structure and the content of each file within, while ignoring unnecessary files or folders.

## Default Ignored Patterns

By default, Clipster will ignore the following files and folders:

- `node_modules`
- `dist`
- `cypress-report`
- `.git`
- Any other patterns specified in `.gitignore`

This ensures that only relevant files are copied when working with folder structures.

## Installation

1. Install the **Clipster** extension from the VSIX file.
2. Open your VS Code instance.
3. Go to the **Extensions** view (`Ctrl+Shift+X`).
4. Click the **three dots** in the top-right corner and select **Install from VSIX...**.
5. Browse to the `.vsix` file you downloaded and click **Install**.

## How to Use

### Copy File Content with Path
1. Right-click any file in the explorer.
2. Select **📄 Copy File Content with Path**.
3. The file's path and content will be copied to your clipboard.

### Copy Folder Structure
1. Right-click a folder in the explorer.
2. Select **📂 Copy Folder Structure**.
3. The folder structure will be copied to your clipboard with emojis.

### Copy Folder Structure and Content
1. Right-click a folder in the explorer.
2. Select **📂📄 Copy Folder Structure and Content**.
3. The folder structure, along with file contents, will be copied to your clipboard.

## Ignoring Files

Clipster will respect any `.gitignore` file it finds in the root of the folder. Additionally, by default, Clipster ignores common folders such as `node_modules` and `dist`. You can customize these settings if necessary.

## Contributing

Feel free to fork this project and submit pull requests. Contributions are always welcome!

## License

This project is licensed under the MIT License.
