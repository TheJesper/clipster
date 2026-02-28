# Spec: Ignore Behavior

## Summary
How Clipster handles `.gitignore` patterns when copying folder structures and content.

## Rules

### Rule 1: Selected folder is always included
When a user right-clicks a folder and selects a copy command, that folder is the **root of the operation**. It is always included regardless of `.gitignore` rules — the user explicitly chose it.

### Rule 2: Contents are filtered by .gitignore
All entries **inside** the selected folder are filtered against `.gitignore` patterns. This applies recursively to all subdirectories.

### Rule 3: Additional ignores stack on top
Patterns from `clipster.additionalIgnores` setting are combined with `.gitignore`. Both apply.

### Rule 4: No .gitignore = no filtering
If no `.gitignore` file exists in the workspace root, only `clipster.additionalIgnores` patterns apply.

## Scenarios

### Scenario: Right-click an ignored folder (e.g. `node_modules/`)
- **Given** `node_modules/` is in `.gitignore`
- **When** user right-clicks `node_modules/` and selects "Copy Folder Structure"
- **Then** `node_modules/` is shown as the root
- **And** its contents are listed (they are children of the selected root, not filtered at this level)
- **Note** Subdirectories inside `node_modules/` that match ignore patterns ARE filtered

### Scenario: Copy structure of a normal folder
- **Given** `src/` contains `index.ts`, `utils/`, and `dist/` (ignored)
- **When** user copies folder structure of `src/`
- **Then** output shows `index.ts` and `utils/`
- **And** `dist/` is excluded

### Scenario: Copy structure with content
- **Given** `src/` contains `index.ts` (10 lines) and `node_modules/` (ignored)
- **When** user copies folder structure and content
- **Then** output includes `index.ts` with its content
- **And** `node_modules/` is excluded
- **And** notification shows line count and size

### Scenario: Empty after filtering
- **Given** a folder contains only ignored files/folders
- **When** user copies folder structure and content
- **Then** warning: "Folder is empty or all files are ignored."
- **And** nothing is copied to clipboard

### Scenario: Additional ignores
- **Given** `clipster.additionalIgnores` is `["*.log", "coverage/**"]`
- **When** user copies folder structure
- **Then** `.log` files and `coverage/` are excluded in addition to `.gitignore` patterns

## Current Implementation
- `ignoreHelper.ts` — `filterIgnoredFiles()` reads `.gitignore` and applies patterns
- `fileHelpers.ts` — `getFolderStructure()` and `getFolderStructureAndContent()` call filter
- `extension.ts` — passes `additionalIgnores` from settings to all copy commands
