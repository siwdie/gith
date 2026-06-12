# gith

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Status](https://img.shields.io/badge/status-WIP-orange)
![Node.js](https://img.shields.io/badge/node-%3E=24-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Commander](https://img.shields.io/badge/Commander.js-CLI-black)
![Clack](https://img.shields.io/badge/%40clack%2Fprompts-interactive-f15bb5)

A small Git workflow CLI built with Commander.js and `@clack/prompts` to make common branch tasks faster, safer, and more consistent.

The project is designed around grouped commands such as `branch`, interactive prompt flows for user input, and Git operations like fetching and rebasing onto the main branch.

## Purpose

`gith` helps reduce repetitive Git work in day-to-day development by wrapping common actions in a guided CLI interface.

The current focus is branch management: creating branches through an interactive flow and updating the current branch against the main branch with a fetch-and-rebase workflow.

## Features

- Grouped CLI structure with subcommands such as `branch create` and `branch update`.
- Interactive branch creation using prompts with select and text inputs, including inline validation and retry behavior.
- Automatic help output through Commander, including command descriptions and option defaults.
- Branch update workflow based on fetching the remote main branch and rebasing the current branch on top of it.
- Small reusable Git helpers that centralize command execution and error handling.

## Current commands

| Command | Description |
|---|---|
| `gith branch create` | Starts an interactive flow to create a `feature/*` or `bugfix/*` branch with validation for the branch name. |
| `gith branch update` | Fetches the configured base branch from the remote and rebases the current branch on top of it. |
| `gith branch --help` | Shows the grouped help output for branch-related commands. |

## Why this approach

Commander is a good fit for this project because it supports subcommands, automatic help generation, default option values, and a structure that scales as the CLI grows.

`@clack/prompts` fits the branch-creation flow because it provides modern interactive prompts such as `select` and `text`, plus cancellation handling for terminal UX that feels closer to tools like pnpm and Vite.

For branch updates, the tool uses a standard Git flow: fetch the latest remote base branch and then rebase the current branch onto it, which keeps history linear and up to date for pull requests.

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

Override the base branch or remote when needed:

```bash
gith branch update --base develop --remote upstream
```

Commander supports option defaults, so `--base` and `--remote` can be omitted when `main` and `origin` are the correct values for the repository.

## Example workflow

A typical branch update flow is:

1. Fetch the latest state of the main branch from the remote.
2. Rebase the current branch onto that updated remote branch.
3. If the branch was already pushed before the rebase, push again with `--force-with-lease` if needed.

Example Git equivalent:

```bash
git fetch origin main
git rebase origin/main
```

That is the behavior `gith branch update` is built around.

## Project structure

```text
src/
  cli.ts
  groups/
    branch.group.ts
  commands/
    branch/
      create.command.ts
      update.command.ts
  utils/
    branch/
      naming.ts
    git.ts
    result.ts
```

This structure keeps command grouping separate from command handlers, while utility modules hold reusable Git and validation logic.

## Roadmap

Planned next steps could include:

- Squash suggestions based on the branch fork point from the main branch.
- Commit helpers and guided commit flows.
- Configurable repository defaults such as base branch and remote.
- Safer rebase UX around conflicts and post-rebase push guidance.

## Notes

This tool wraps Git, so it should be run inside a valid Git repository.

Because rebasing rewrites commit history, using the update command on a branch that was already pushed may require an additional push with `--force-with-lease` afterward.