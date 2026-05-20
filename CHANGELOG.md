# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0](https://github.com/TheJesper/clipster/compare/v1.2.112...v1.3.0) (2026-03-02)

This is a major release that modernizes the entire codebase, dramatically improves
reliability, and adds new user-facing features. Inspired in part by
[jnerytech's PR #2](https://github.com/TheJesper/clipster/pull/2), the extension
was fully migrated to TypeScript and restructured for long-term maintainability.

### Added

- **TypeScript migration** -- complete rewrite of all source files from JavaScript to
  TypeScript with strict type-checking (inspired by jnerytech PR #2).
- **Emoji settings** -- new `clipster.showEmojis` toggle lets users enable or disable
  emoji prefixes in clipboard output.
- **Hardened create-from-clipboard validation** -- the "Create File or Folder from
  Clipboard" command now rejects clipboard content that looks like code or prose,
  preventing accidental file creation. The command is disabled by default.
- **Interactive dev menu** -- `npm run menu` launches an ASCII-logo developer menu
  (powered by boxen) for common build, test, and release tasks.
- **Specs folder** -- added `specs/` for spec-driven development, keeping feature
  specifications alongside the code.
- **127 unit tests** -- test suite expanded from 4 original tests to 127, reaching
  91 %+ code coverage across all modules.
- **MIT LICENSE file** restored to the repository root.

### Changed

- **README rewrite** -- full rewrite with settings tables, feature descriptions, and
  usage examples.
- **.vscodeignore overhaul** -- reduced packaged extension from 3 321 files down to 6,
  cutting install size dramatically.
- **Graceful error handling** -- errors during folder scanning and clipboard operations
  now surface as warnings instead of modal error dialogs, eliminating error spam.
- **Modular architecture** -- core logic split into focused modules (`fileHelpers`,
  `ignoreHelper`, `clipboardHelper`, `fileUtils`, `directoryUtils`,
  `structureFormatter`, `pathUtils`, `messageUtils`, `logger`).

### Fixed

- **Windows path handling** -- resolved path-separator issues that caused failures on
  Windows when copying folder structures.
- **Empty folder guard** -- copying the structure of an empty directory no longer throws
  an unhandled error.
- **Config key scoping** -- fixed configuration keys that were not properly scoped under
  the `clipster.*` namespace, causing settings to be silently ignored.

## [1.2.107](https://github.com/TheJesper/clipster/compare/v1.2.106...v1.2.107) (2026-02-28)

### Fixed

- Update `qs` to 6.14.1 to fix CVE-2025-15284.

## [1.2.106](https://github.com/TheJesper/clipster/compare/v1.2.105...v1.2.106) (2025-02-19)

Patch releases 1.2.7 -- 1.2.106 were incremental build and packaging iterations
with no user-facing changes.

## [1.2.0](https://github.com/TheJesper/clipster/compare/v1.1.14...v1.2.0) (2025-01-04)

### Added

- Copy/paste file and folder commands (`clipster.copyFile`, `clipster.pasteFile`).
- Root folder commands: copy root path, root structure, root structure with content.
- `clipster.additionalIgnores` setting for custom ignore patterns.
- `clipster.maxRootFiles` and `clipster.maxRootSizeKB` settings to limit root-folder
  copy operations.
- Conditional command registration controlled by per-command boolean settings.
- Clipster submenu in Explorer context menu (toggled via `clipster.showInClipsterSubmenu`).

### Changed

- Webpack build pipeline replaced ad-hoc compilation.
- Configuration change listener re-registers all commands dynamically.

## [1.1.0](https://github.com/TheJesper/clipster/compare/v1.0.31...v1.1.1) (2024-11-04)

### Added

- `.gitignore`-aware file filtering using the `ignore` npm package.
- Copy folder structure command.
- Copy folder structure with file contents command.
- Copy file content with path header command.

## [1.0.0](https://github.com/TheJesper/clipster/releases/tag/v1.0.4) (2024-10-04)

### Added

- Initial release of Clipster.
- Create file or folder from clipboard content.
- Basic Explorer context-menu integration.
