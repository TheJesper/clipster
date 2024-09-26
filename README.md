
# Clipster

Clipster is a VSCode extension for copying file and folder paths and contents with emojis.

## Requirements
- Node.js (>= v14.x.x)
- Yarn (>= 1.22.0)
- Visual Studio Code (>= 1.93.0)

## Scripts

| Script              | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `yarn clean`        | Cleans the `out` directory by removing its contents.           |
| `yarn build`        | Builds the extension by packaging it into a VSIX file.         |
| `yarn install`      | Installs the extension into your local VSCode instance.        |
| `yarn bump-build`   | Bumps version, builds the extension, and updates the changelog.|
| `yarn clean-build-install` | Cleans, builds, and installs the extension in one go.   |
| `yarn release`      | Prepares the extension for release, bumping the version.       |

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheJesper/clipster
   cd clipster
   ```

2. Install the dependencies:
   ```bash
   yarn install
   ```

3. Build the extension:
   ```bash
   yarn build
   ```

4. Install the extension:
   ```bash
   yarn install
   ```

5. Start using Clipster in VSCode!

## License
This project is licensed under the MIT License.
