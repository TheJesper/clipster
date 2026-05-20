# Spec: Create File or Folder from Clipboard

## Summary
Reads clipboard text and creates files and/or folders from it. Each non-empty line is interpreted as a path. This is a **legacy feature** from the pre-agentic era, before AI tools could scaffold project structures. It is **disabled by default**.

## Setting
| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `clipster.showCreateFileFromClipboard` | boolean | `false` | Enable the "Create File or Folder from Clipboard" context menu command |

## Syntax
- One path per line
- Trailing `/` or `\` = create a **folder** (with `mkdirSync recursive`)
- No trailing slash = create an **empty file** (parent directories are created automatically)
- Leading/trailing whitespace on each line is trimmed
- Blank lines are skipped

### Path resolution
| Clipboard line | Resolved to |
|----------------|-------------|
| `index.ts` (bare name) | `<right-clicked folder>/index.ts` |
| `src/utils/helper.ts` (contains separator) | `<workspace root>/src/utils/helper.ts` |
| `/absolute/path/file.ts` | `/absolute/path/file.ts` (used as-is) |

## Validation Rules (`isValidPath`)

Every line is validated before any filesystem operation. Invalid lines are silently skipped (logged as warning, no error popup). The validation is intentionally strict to prevent accidental file creation from code or prose in the clipboard.

### Rejection rules

| Rule | Example | Reason |
|------|---------|--------|
| Empty string | `""` | Nothing to create |
| Path length > 260 chars | `"a" * 261` | Exceeds filesystem limits |
| Segment length > 255 chars | `src/` + `"a" * 256` + `.ts` | Exceeds filename limits |
| Empty segment | `src//file.ts` | Invalid path component |
| Null bytes | `file\x00.ts` | Control character (rejected on all platforms) |
| Windows reserved chars | `<>:"\|?*` and `\x00-\x1F` | Invalid on Windows (`win32` platform only) |
| Code-like characters | `(){}\[\];=+!@#$%^&\`~` | Looks like code, not a path |
| Consecutive whitespace | `this is  some text` | Looks like prose, not a path |

### Acceptance rules

| Input | Valid? | Why |
|-------|--------|-----|
| `index.ts` | Yes | Plain filename |
| `src/components/App.tsx` | Yes | Relative path with separator |
| `my-component_v2.tsx` | Yes | Hyphens, underscores, dots allowed |
| `src/utils/` | Yes | Folder (trailing slash) |
| `my file.txt` | Yes | Single spaces are allowed |

## Scenarios

### Scenario: Create a single file
- **Given** clipboard contains `newfile.ts`
- **When** user right-clicks a folder and selects "Create File or Folder from Clipboard"
- **Then** an empty file `newfile.ts` is created in the right-clicked folder
- **And** notification: "Created 1 file(s) and 0 folder(s)."

### Scenario: Create a single folder
- **Given** clipboard contains `newfolder/`
- **When** user right-clicks a folder and selects "Create File or Folder from Clipboard"
- **Then** folder `newfolder/` is created
- **And** notification: "Created 0 file(s) and 1 folder(s)."

### Scenario: Backslash trailing separator
- **Given** clipboard contains `newfolder\`
- **When** user executes the command
- **Then** a folder is created (backslash treated as folder indicator)

### Scenario: Mixed files and folders
- **Given** clipboard contains:
  ```
  a.ts
  b.ts
  folder/
  ```
- **When** user executes the command
- **Then** 2 files and 1 folder are created
- **And** notification: "Created 2 file(s) and 1 folder(s)."

### Scenario: Invalid path is skipped
- **Given** clipboard contains `bad\x00file.ts`
- **When** user executes the command
- **Then** no file is created
- **And** warning: "Created 0 file(s) and 0 folder(s). 1 item(s) skipped (invalid or failed)."

### Scenario: Code in clipboard is rejected

| Clipboard line | Rejected by |
|----------------|-------------|
| `function App() {` | Code pattern (`{`) |
| `const x = 1;` | Code pattern (`;`, `=`) |
| `import React from 'react';` | Code pattern (`;`) |

- **When** any of these are in the clipboard
- **Then** each line is skipped, counted as error in summary

### Scenario: Prose in clipboard is rejected
- **Given** clipboard contains `this is  some text` (two consecutive spaces)
- **When** user executes the command
- **Then** the line is skipped (consecutive whitespace = likely prose)

### Scenario: Empty clipboard
- **Given** clipboard is empty or contains only whitespace
- **When** user executes the command
- **Then** error message: "Clipboard is empty or contains only whitespace."
- **And** no files or folders are created

### Scenario: Base directory cannot be determined
- **Given** the right-clicked item no longer exists (e.g., deleted between click and execution)
- **When** user executes the command
- **Then** error message: "Unable to determine the base directory."

### Scenario: Filesystem error during creation
- **Given** clipboard contains a valid path but the filesystem rejects the write (e.g., permission denied)
- **When** user executes the command
- **Then** the path is counted as an error in the summary
- **And** warning message includes the skip count

## Security Considerations

The validation is intentionally strict because clipboard content is **untrusted input**. Users may have arbitrary text in their clipboard (code snippets, prose, URLs) and accidentally trigger this command. Without validation, the extension could:

1. **Create hundreds of garbage files** from pasted source code (each line becoming a file)
2. **Create files with dangerous names** containing special characters
3. **Create deeply nested directories** from long strings

The code-pattern and prose-pattern checks are the primary defense: they reject any line that looks like it was not intentionally formatted as a file path.

## Current Implementation
- `fileHelpers.ts` -- `isValidPath()` validates each line; `createFileOrFolderFromClipboard()` orchestrates the operation
- `pathUtils.ts` -- `getBaseDirectory()` determines the target folder; `resolveTargetPath()` resolves relative vs. absolute paths
- `extension.ts` -- registers the command conditionally via `clipster.showCreateFileFromClipboard`
