# gith

![Version](https://img.shields.io/badge/version-0.3.0-blue)
![Status](https://img.shields.io/badge/status-WIP-orange)
![Node.js](https://img.shields.io/badge/node-%3E=24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Commander](https://img.shields.io/badge/Commander.js-CLI-black)
![Clack](https://img.shields.io/badge/%40clack%2Fprompts-interactive-f15bb5)

A small Git workflow CLI built with `Commander.js` and `@clack/prompts` to make common branch tasks faster, safer, and more consistent.

The project is designed around grouped commands such as `branch`, interactive prompt flows for user input, and Git operations like fetching, rebasing, committing, and squashing branch history.

## Purpose

`gith` helps reduce repetitive Git work in day-to-day development by wrapping common actions in a guided CLI interface.

The current focus is branch management: creating branches, updating the current branch against the base branch, creating conventional commits, and grouping branch history into a single commit.

## Features

- Grouped CLI structure with subcommands such as `branch create`, `branch update`, `branch commit`, and `branch squash`.
- Interactive flows using Clack prompts with validation, confirmation steps, and cancel handling.
- Automatic help output through Commander, including command descriptions and option defaults.
- Branch update workflow based on fetching the remote base branch and rebasing the current branch on top of it.
- Conventional commit helper for guided commit message creation.
- Squash workflow for grouping branch commits into a single commit once the working tree is clean.
- Small reusable Git helpers that centralize command execution and error handling.

## Current commands

| Command | Description |
|---|---|
| `gith branch create` | Starts an interactive flow to create a `feature/*` or `bugfix/*` branch with validation for the branch name. |
| `gith branch update` | Fetches the configured base branch from the remote and rebases the current branch on top of it. |
| `gith branch commit` | Creates a guided conventional commit for the current branch, with optional staging through `--all`. |
| `gith branch squash` | Groups the branch commits into a single commit after verifying that the working tree is clean. |
| `gith branch --help` | Shows the grouped help output for branch-related commands. |

## Why this approach

Commander is a good fit for this project because it supports subcommands, automatic help generation, default option values, and a structure that scales as the CLI grows.

`@clack/prompts` fits these workflows because it provides modern interactive prompts such as `select`, `text`, `multiline`, and `confirm`, plus cancellation handling for terminal UX that feels closer to tools like pnpm and Vite.

For branch updates, the tool uses a standard Git flow: fetch the latest remote base branch and then rebase the current branch onto it, which keeps history linear and up to date for pull requests.

For commit and squash flows, the tool builds guided commit messages and branch cleanup steps on top of reusable Git utilities.

## Installation

Clone the project and install dependencies:

```bash
pnpm install
```

Run it in development mode with your preferred Node.js workflow, or build it and expose it as a CLI command through the package `bin` entry.

If the package is configured with a `bin` field, it can be installed globally and used as a normal terminal command after build.

## Usage

Show the root help:

```bash
gith --help
```

Show the branch group help:

```bash
gith branch --help
```

Create a branch interactively:

```bash
gith branch create
```

Update the current branch against the main branch:

```bash
gith branch update
```

Create a guided conventional commit:

```bash
gith branch commit
```

Create a guided conventional commit and stage changes automatically:

```bash
gith branch commit --all
```

Group branch commits into a single commit:

```bash
gith branch squash
```

Override the base branch or remote when needed:

```bash
gith branch update --base develop --remote upstream
```

Use a different base branch for squash when needed:

```bash
gith branch squash --base develop
```

Commander supports option defaults, so flags such as `--base` and `--remote` can be omitted when the default repository configuration is correct.

## Example workflow

A typical branch workflow can be:

1. Create a new feature or bugfix branch.
2. Commit changes with the guided conventional commit flow.
3. Update the branch with the latest changes from the base branch.
4. Squash the branch history into a single commit before opening or updating a pull request.

Example Git equivalents:

```bash
git checkout -b feature/my-branch
git add -A
git commit -m "feat(branch): add guided commit flow"
git fetch origin main
git rebase origin/main
```

The squash step is built around grouping the branch-only commits into a single final commit once the working tree is clean.

## Project structure

```text
src/
  cli.ts
  commands/
    branch/
      commit.command.ts
      create.command.ts
      squash.command.ts
      update.command.ts
  constants/
    commit.ts
  groups/
    branch.group.ts
  guards/
    prompt.ts
  utils/
    branch/
      naming.ts
    git.ts
    result.ts
```

This structure keeps command grouping separate from command handlers, while utility modules hold reusable Git, validation, and prompt-guard logic.

## Roadmap

Planned next steps could include:

- Smarter squash suggestions based on the real branch fork point.
- Configurable repository defaults such as base branch and remote.
- Safer rebase UX around conflicts and post-rebase push guidance.
- Better commit presets or branch-aware scope suggestions.

## Notes

This tool wraps Git, so it should be run inside a valid Git repository.

Because rebasing and squashing rewrite commit history, running update or squash on a branch that was already pushed may require an additional push with `--force-with-lease` afterward.