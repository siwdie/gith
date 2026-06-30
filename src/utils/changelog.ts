import { readFile, writeFile } from 'node:fs/promises'

import type { Changelog } from '~/config/config.types.js'
import type { Maybe } from '~/types/common.js'
import type { GitCommit } from '~/utils/git.js'
import type { ResultType } from '~/utils/result.js'

import { getCommitsBetween } from '~/utils/git.js'
import { createDataResult, createErrorResult } from '~/utils/result.js'
import { capitalize } from '~/utils/string.js'



type ParsedCommit = {
  type: string
  scope: Maybe<string>
  description: string
  breaking: boolean
  author: Maybe<string>
}

const CHANGELOG_HEADING = '# Changelog'
const EMPTY_CHANGELOG_CONTENT = `${CHANGELOG_HEADING}\n\n`


export async function generateChangelogEntryFromTagRange (
  changelogConfig: Changelog,
  previousTag: string,
  currentTag: string,
): Promise<ResultType<string>> {
  const commitsResult = await getCommitsBetween(previousTag, currentTag)

  if (commitsResult.error !== null) {
    return createErrorResult(commitsResult.error)
  }

  const commits = commitsResult.data
    .map(parseConventionalCommit)
    .filter((commit): commit is ParsedCommit => commit !== null)

  const sections: Array<string> = [`## ${currentTag}`, '']

  const breakingCommits = commits.filter(commit => commit.breaking)
  appendSection(sections, changelogConfig.breakingTitle, breakingCommits, changelogConfig.authors)

  for (const section of changelogConfig.sections) {
    const sectionCommits = commits.filter(commit =>
      !commit.breaking && section.types.includes(commit.type),
    )

    appendSection(sections, section.title, sectionCommits, changelogConfig.authors)
  }

  if (sections.length === 2) {
    sections.push(`- ${changelogConfig.emptyMessage}`, '')
  }

  return createDataResult(sections.join('\n').trimEnd() + '\n')
}

export async function prependChangelogEntry (changelogConfig: Changelog, entry: string): Promise<ResultType<string>> {
  try {
    const currentContent = await readFile(changelogConfig.file, 'utf8')
      .catch(() => EMPTY_CHANGELOG_CONTENT)

    const normalizedContent = currentContent.startsWith(CHANGELOG_HEADING)
      ? currentContent
      : `${CHANGELOG_HEADING}\n\n${currentContent}`

    const body = normalizedContent.replace(/^# Changelog\s*/u, '').trimStart()
    const nextContent = `${CHANGELOG_HEADING}\n\n${entry}\n${body}`.trimEnd() + '\n'

    await writeFile(changelogConfig.file, nextContent, 'utf8')

    return createDataResult(changelogConfig.file)
  }
  catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to write CHANGELOG.md.'))
  }
}

export async function rebuildChangelogFromTags (changelogConfig: Changelog, tags: Array<string>): Promise<ResultType<string>> {
  try {
    const pairs = tags.slice(1).map((currentTag, index) => [tags[index]!, currentTag] as const)
    const entryResults = await Promise.all(
      pairs.map(([previousTag, currentTag]) =>
        generateChangelogEntryFromTagRange(changelogConfig, previousTag, currentTag)),
    )

    const failedResult = entryResults.find(result => result.error !== null)

    if (failedResult?.error) {
      return createErrorResult(failedResult.error)
    }

    const entries = entryResults
      .map(result => result.data)
      .filter((entry): entry is string => Boolean(entry))
      .reverse()

    const content = [
      CHANGELOG_HEADING,
      '',
      ...entries.flatMap(entry => [entry.trimEnd(), '']),
    ].join('\n').trimEnd() + '\n'

    await writeFile(changelogConfig.file, content, 'utf8')

    return createDataResult(changelogConfig.file)
  }
  catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to rebuild CHANGELOG.md.'))
  }
}

export async function changelogHasVersion (file: string, version: string): Promise<boolean> {
  try {
    const content = await readFile(file, 'utf8')
    const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    return new RegExp(`^## ${escapedVersion}$`, 'mu').test(content)
  }
  catch {
    return false
  }
}

function parseConventionalCommit (commit: GitCommit): Maybe<ParsedCommit> {
  const header = commit.message.split(/\r?\n/u, 1)[0] ?? ''
  const match = /^(?<type>[a-z][a-z0-9-]*)(?:\((?<scope>[^)]+)\))?: (?<description>.+)$/u.exec(header)

  const type = match?.groups?.type?.trim() ?? ''
  const description = match?.groups?.description?.trim() ?? ''

  if (!type || !description) {
    return null
  }

  const hasBreakingFooter = /(^|\r?\n)BREAKING CHANGE(\r?\n|$)/u.test(commit.message)

  return {
    type,
    scope: match?.groups?.scope?.trim() ?? null,
    description,
    breaking: hasBreakingFooter,
    author: commit.author?.trim() || null,
  }
}

function appendSection (
  lines: Array<string>,
  title: string,
  commits: Array<ParsedCommit>,
  authorsConfig: Changelog['authors'],
): void {
  if (!commits.length) return

  lines.push(`### ${title}`)

  for (const commit of commits) {
    const scopePrefix = commit.scope ? `**${commit.scope}:** ` : ''
    const authorSuffix = authorsConfig && commit.author ? ` (${commit.author})` : ''
    lines.push(`- ${scopePrefix}${capitalize(commit.description)}${authorSuffix}`)
  }

  lines.push('')
}
