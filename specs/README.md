# Clipster Specs

Behavioral specifications for the Clipster VS Code extension. These specs define **what** the extension should do, not how. Tests should validate these specs.

## Spec Files

| Spec | Covers |
|------|--------|
| [copy-commands.md](copy-commands.md) | All copy/paste/create commands, menu order, emoji behavior |
| [ignore-behavior.md](ignore-behavior.md) | .gitignore filtering, additionalIgnores, edge cases |

## Process

1. **New feature?** Write spec first, then implement
2. **Bug?** Add scenario to relevant spec, then fix
3. **Refactor?** Verify specs still hold after changes
