# Contributing to Clipster

Welcome! Clipster is open to contributors of all experience levels. Whether you're fixing a bug, adding a feature, or improving docs — your help is appreciated.

## Getting Started

1. Fork and clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the interactive dev menu:
   ```bash
   npm run menu
   ```

## Development Workflow

All dev tasks are available through `npm run menu`. This interactive menu covers:

- **Build** — TypeScript check + production Webpack bundle
- **Test** — Run Jest test suite with coverage
- **Type-check** — TypeScript compiler validation only
- **Install extension** — Package and install the VSIX locally
- **Clean build** — Full clean + version bump + build + install

You can also run commands directly (`npm test`, `npm run build`, etc.), but the menu is the recommended starting point.

## Code Style

- **TypeScript** with strict mode enabled
- **Webpack** bundles everything into `dist/extension.js`
- Follow existing patterns in `src/` — small, focused modules with clear responsibilities
- Use the established module structure: helpers, utils, and the main `extension.ts` entry point

## Testing

- Every new feature or bug fix must include tests
- Tests live in `src/test/` alongside a VS Code mock (`__mocks__/vscode.ts`)
- Run the full suite:
  ```bash
  npm test
  ```
- Run only changed tests during development:
  ```bash
  npm run test:quick
  ```
- Maintain or improve existing coverage — don't merge code that lowers it

## Spec-Driven Development

Before implementing a feature, write a spec in the `specs/` folder:

1. Create a spec file describing the expected behavior
2. Get agreement on the spec (via issue or PR discussion)
3. Implement the feature to satisfy the spec
4. Write tests that verify the spec

This keeps features well-defined and prevents scope creep.

## Submitting PRs

1. Create a feature branch from `main`
2. Make focused, atomic commits
3. Use the PR template and describe your changes clearly
4. Reference any related issues (e.g., "Fixes #12")
5. Ensure `npm test` and `npm run build` pass before submitting

## Code of Conduct

Be respectful and constructive. We're all here to build something useful. Harassment, insults, or dismissive behavior won't be tolerated.

## Credits

Contributors are credited in commit messages. Significant contributions are recognized in release notes.

Thanks for contributing!
