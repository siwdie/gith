# gith

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-WIP-orange)
![Node.js](https://img.shields.io/badge/node-%3E=24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Commander](https://img.shields.io/badge/Commander.js-CLI-black)
![Clack](https://img.shields.io/badge/%40clack%2Fprompts-interactive-f15bb5)

`gith` is a small Git workflow CLI for creating branches, updating them from a base branch, writing conventional commits, and squashing branch history with a guided terminal experience.

Built with `Commander.js` and `@clack/prompts`.

## Quick start

Install dependencies:

```bash
pnpm install
```

Show help:

```bash
gith --help
```

Create a project config file:

```bash
gith init
```

Create a branch:

```bash
gith branch create
```

Create a commit:

```bash
gith branch commit
```

Update your branch from the base branch:

```bash
gith branch update
```

Squash branch commits into one:

```bash
gith branch squash
```

## What it does

`gith` helps reduce repetitive Git work by wrapping common branch actions in a guided CLI flow.

Current features include:
- Interactive branch creation
- Branch update via fetch + rebase
- Guided conventional commits
- Commit squashing for branch cleanup
- Project-level defaults through `gith.config.json`

## Commands

| Command | Description |
|---|---|
| `gith init` | Create a `gith.config.json` file with the default project configuration. |
| `gith branch create` | Create a branch interactively using the configured branch types. |
| `gith branch update` | Fetch the base branch from the remote and rebase the current branch on top of it. |
| `gith branch commit` | Create a guided conventional commit for the current branch. |
| `gith branch commit --all` | Stage tracked changes and create a guided conventional commit. |
| `gith branch squash` | Squash branch commits into a single commit once the working tree is clean. |
| `gith branch --help` | Show help for branch-related commands. |

## Configuration

`gith` supports an optional `gith.config.json` file in the project root.

If the file exists, `gith` uses that project configuration. If it does not, the CLI falls back to its built-in defaults.

Generate the default config file with:

```bash
gith init
```

Overwrite an existing config file with:

```bash
gith init --force
```

### Supported fields

| Field | Type | Description |
|---|---|---|
| `defaultBranch` | `string` | Default base branch for commands like `branch update` and `branch squash`. |
| `branchTypes` | `Array<{ value, label, hint? }>` | Branch types shown in `branch create`. |
| `commitTypes` | `Array<{ value, label, hint? }>` | Commit types shown in `branch commit`. |

### Default config

```json
{
  "defaultBranch": "main",
  "branchTypes": [
    {
      "value": "feature",
      "label": "feature",
      "hint": "A new feature branch"
    },
    {
      "value": "bugfix",
      "label": "bugfix",
      "hint": "A bug fix branch"
    }
  ],
  "commitTypes": [
    {
      "value": "feat",
      "label": "feat",
      "hint": "A new feature"
    },
    {
      "value": "fix",
      "label": "fix",
      "hint": "A bug fix"
    },
    {
      "value": "docs",
      "label": "docs",
      "hint": "Documentation only changes"
    },
    {
      "value": "refactor",
      "label": "refactor",
      "hint": "Code change without feature or fix"
    },
    {
      "value": "test",
      "label": "test",
      "hint": "Add or update tests"
    },
    {
      "value": "chore",
      "label": "chore",
      "hint": "Maintenance tasks"
    }
  ]
}
```

## Typical workflow

A common flow looks like this:

1. Run `gith init` once if you want project-specific defaults.
2. Create a new branch with `gith branch create`.
3. Commit changes with `gith branch commit`.
4. Update the branch with `gith branch update`.
5. Clean up the history with `gith branch squash`.

## Notes

Run `gith` inside a valid Git repository.

Because rebasing and squashing rewrite history, you may need to push again with `--force-with-lease` if the branch was already pushed.