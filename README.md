<h1 align="center" style="margin: 0; font-size: 72px; line-height: 1;">
  gith
</h1>

<p align="center" style="margin: 10px 0 0;">
  <strong>Small Git workflow CLI for branches, conventional commits, rebases, and squash flows.</strong>
</p>
<p align="center" style="margin: 20px 0 0;">
  <a href="https://github.com/siwdie/gith/releases">
    <img src="https://img.shields.io/github/v/release/siwdie/gith" alt="Latest release" />
  </a>
  <a href="https://github.com/siwdie/gith/actions">
    <img src="https://github.com/siwdie/gith/actions/workflows/release.yml/badge.svg?event=release" alt="Build status" />
  </a>
  <a href="https://www.npmjs.com/package/gith">
    <img src="https://img.shields.io/npm/v/@siwdie/gith" alt="npm version" />
  </a>
  <a href="https://github.com/siwdie/gith/actions">
    <img src="https://github.com/siwdie/gith/actions/workflows/main.yml/badge.svg?branch=main&event=push" alt="Build status" />
  </a>
</p>


## Quick start

Install as a dev dependency:

```bash
npm install -D gith
```

Initialize the project config:

```bash
npx gith init
```

### Standalone installation

#### Homebrew (macOS and Linux)

```bash
brew tap siwdie/gith
brew install gith
```

If Homebrew does not resolve the short name on your system, use:

```bash
brew install siwdie/gith/gith
```

#### Supported Homebrew targets

Homebrew installation is currently supported for:

- macOS arm64
- Linux x86_64

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
| `gith branch rename` | Rename a branch interactively using the configured branch types. |
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

### JSON Schema

`gith.config.json` ships with a JSON Schema for editor autocompletion and validation. The generated config already includes the `$schema` field, so your IDE only needs to trust that schema source to enable validation and completions.

### Supported fields

| Field | Type | Description |
|---|---|---|
| `defaultBranch` | `string` | Default base branch for new branches. |
| `monorepo.type` | `"pnpm" \| "yarn"` | Package manager or build tool used to manage the monorepo workspaces. |
| `branchTypes` | `Array<{ value, label?, hint? }>` | Available branch types for the branch creation command. |
| `commitTypes` | `Array<{ value, label?, hint? }>` | Available commit types for the commit command. |
| `scope` | `object \| undefined` | Scope prompt configuration for non-monorepo projects. When omitted, scope is disabled. |
| `scope.type` | `"text" \| "select"` | Scope prompt mode. |
| `scope.placeholder` | `string` | Placeholder text shown in the input. Only used when `scope.type` is `text`. |
| `scope.required` | `boolean` | Whether scope is required. |
| `scope.options` | `Array<{ value, label?, hint? }>` | List of scope options. Only used when `scope.type` is `select`. |
| `commit.header.minLength` | `number` | Minimum character length for the short description. |
| `commit.header.maxLength` | `number` | Maximum character length for the short description. |
| `commit.body` | `boolean \| object` | Enable or configure the commit body prompt. |
| `commit.body.required` | `boolean` | Whether to prompt for a commit body. |
| `commit.body.maxLength` | `number` | Maximum character length for the commit body. |

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