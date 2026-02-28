# Spec: Copy Commands

## Summary
Behavioral specification for all Clipster copy operations.

## Commands

### Copy Folder Structure
- **Input:** Right-click a folder or file
- **Behavior:** If file selected, uses parent folder. Recursively builds ASCII tree.
- **Output:** Unicode tree with `┣ ┗ ┃` characters, emoji icons if enabled
- **Filters:** `.gitignore` + `additionalIgnores`

### Copy Folder Structure and Content
- **Input:** Right-click a folder or file
- **Behavior:** Same as structure, but appends file contents after each file entry
- **Output:** Tree structure interleaved with file contents
- **Filters:** `.gitignore` + `additionalIgnores`
- **Guard:** If result is empty after filtering → show warning, don't copy
- **Feedback:** Shows line count and size in KB

### Copy File(s) Content with Path
- **Input:** Right-click one or more files (multi-select supported)
- **Behavior:** For each file, outputs `File: <path>` header followed by content
- **Output:** Concatenated file contents with path headers
- **Feedback:** Shows file count

### Copy Root Folder Path
- **Input:** Any context (no selection needed)
- **Behavior:** Gets workspace root path
- **Output:** `Root Path: <path>`

### Copy Root Folder Structure
- **Input:** Any context
- **Behavior:** Same as Copy Folder Structure but from workspace root
- **Filters:** `.gitignore` + `additionalIgnores`

### Copy Root Folder Structure and Content
- **Input:** Any context
- **Behavior:** Same as Copy Folder Structure and Content but from workspace root
- **Limits:** `maxRootFiles` (default: 10), `maxRootSizeKB` (default: 500)
- **Feedback:** Warning when limits are reached

### Copy File(s)
- **Input:** Right-click a file
- **Behavior:** Copies file path to clipboard for paste operation
- **Output:** File path string

### Paste File(s)
- **Input:** Right-click a folder
- **Behavior:** Reads file path from clipboard, copies file to target folder
- **Guard:** Warns if destination file already exists (does not overwrite)

### Create File or Folder from Clipboard
- **Input:** Right-click a folder
- **Behavior:** Reads clipboard lines, creates files/folders. Lines ending in `/` or `\` → folder, else → file
- **Guard:** Invalid paths are skipped (logged as warning, not error popup)
- **Feedback:** Summary with counts. Warning if any items skipped.

## Emoji Behavior
- Controlled by `clipster.showEmojis` setting (default: `true`)
- Tree output: `📁` folders, `📄` files, `🖥️` root header
- Menu titles: Always show emojis (VS Code static manifest)
- Requires reload to take effect

## Menu Order (context menu)
1. Copy structure commands (folder)
2. Copy root commands
3. Copy/paste file commands
4. Create from clipboard (bottom)
