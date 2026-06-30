# Changelog

## v1.8.0

### Added
- Add release hooks
- Add install script for macos and linux
- Add support to gradle, maven and cargo monorepos
- Update brew formula to v1.7.0

### Changed
- Change default commit types

### Fixed
- Split binaries build in different processes one per platform
- Set correct sha256 in brew formula

## v1.7.0

### Added
- Add support for release per project in monorepo
- Add support for pnpm and yarn-berry monorepositories
- Exclude binary files that already has version from renaming process

### Changed
- Optimize binaries build method

### Fixed
- Correct typo in body validation
- Remove deprecated script from release workflow
- Change release action to build macos binaries correctly

## v1.6.0

### Added
- Add binaries job to release action
- Add standalone binary support via pkg

### Changed
- Allow command help even if it's not a git repository

## v1.5.0

### Added
- Add new config props for commit command
- Use zod to parse config instead of custom guard
- Add validation schema for config file

### Changed
- Use clear instead of stop method on spinner end
- Make label optional in select option field
- Check if current folder is valid git repo only once at init
- Optimize config loader logic + show correct version in cli
- Optimize guards and utils
- Delete unused files
- Use clack is-cancel guard instead of custom function

## v1.4.0

- No user-facing changes.

## v1.3.2

### Added
- Add new release command

## v1.3.1

### Added
- Add release to default commit type list

### Changed
- Delete unused import

### Fixed
- Check staged changes after staging files when --all is passed

## v1.3.0

### Added
- Add branch rename command

### Changed
- Optimize proccess exit + extract some logic to common helpers

## v1.2.1

- No user-facing changes.

## v1.2.0

### Added
- Allow default branch to be updated + add spinner loading

### Changed
- Remove unused imports
- Use outro instead of spinner stop message at the end of update command

## v1.1.0

### Added
- Improve squash command reusing commit prompt function
- Add preview info and commit range selector to squash command

## v1.0.0

### Added
- Add init command to generate local gith config file
- Add support to custom config via gith.config.json file
