<!-- trunk-ignore-all(markdownlint/MD033) -->
<!-- trunk-ignore(markdownlint/MD041) -->

<div align="center">
  <h2 style="font-size: 56px;">
    gith
  </h2>

  <h3 style="font-size: 18px;">
    Small Git workflow CLI for branches, conventional commits, rebases, and squash flows.
  </h3>

[![Latest release](https://img.shields.io/github/v/release/siwdie/gith)](https://github.com/siwdie/gith/releases)
[![Main build status](https://github.com/siwdie/gith/actions/workflows/main.yml/badge.svg?branch=main&event=push)](https://github.com/siwdie/gith/actions/workflows/main.yml)
[![Release status](https://github.com/siwdie/gith/actions/workflows/release.yml/badge.svg?event=release)](https://github.com/siwdie/gith/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/@siwdie/gith)](https://www.npmjs.com/package/@siwdie/gith)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](./LICENSE)

</div>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#standalone-installation">Install</a> ·
  <a href="#what-it-does">What it does</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#configuration">Configuration</a> ·
</p>


## Quick start

Install as a dev dependency:

```bash
npm install -D @siwdie/gith
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


#### macOS & Linux


Install the latest standalone binary with the install script:


```bash
curl -fsSL https://raw.githubusercontent.com/siwdie/gith/main/scripts/install.sh | sh
```

Install to a custom directory:

```bash
curl -fsSL https://raw.githubusercontent.com/siwdie/gith/main/scripts/install.sh | sh -s -- --bin-dir ~/.local/bin
```

#### Linux

If you prefer a manual install, download the latest Linux binary from the [Releases](https://github.com/siwdie/gith/releases) page, make it executable, and move it to a directory in your `PATH`:

```bash
chmod +x gith-vX.Y.Z-linux-x64
mv gith-vX.Y.Z-linux-x64 ~/.local/bin/gith
```

#### Windows

Download the latest Windows binary from the [Releases](https://github.com/siwdie/gith/releases) page and place `gith-vX.Y.Z-win-x64.exe` in a directory that is part of your `Path`, for example:


```powershell
mkdir "$env:USERPROFILE\AppData\Local\Programs\gith" -Force
move .\gith-vX.Y.Z-win-x64.exe "$env:USERPROFILE\AppData\Local\Programs\gith\gith.exe"
```

#### Supported Homebrew targets

Homebrew installation is currently supported for:

- macOS arm64
- Linux x64

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
| `gith branch release` | Create a release commit and tag for the given version. |
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
| `monorepo.type` | `"pnpm" \| "yarn" \| "gradle" \| "maven" \| "cargo"` | Package manager or build tool used to manage the monorepo workspaces. |
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
| `release` | `object \| undefined` | Configuration for the release flow. |
| `release.hooks` | `object \| undefined` | Shell commands executed during the release flow. |
| `release.hooks.beforeCommit` | `string \| undefined` | Shell command to run before creating the release commit. Supports `{{version}}`, `{{tag}}`, `{{scope}}`, and `{{branch}}`. |

### Release hooks

You can run a shell command before the release commit is created.

```json
{
  "release": {
    "hooks": {
      "beforeCommit": "pnpm version {{version}} --no-git-tag-version && git add package.json"
    }
  }
}
```
The hook runs before the release commit is created. If it exits with a non-zero status, the release is aborted.

If the hook changes files, it must also stage them explicitly.

## Notes

Run `gith` inside a valid Git repository.

Because rebasing and squashing rewrite history, you may need to push again with `--force-with-lease` if the branch was already pushed.