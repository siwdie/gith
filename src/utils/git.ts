import { execa } from 'execa'

import type { ResultType } from '~utils/result.js'

import { createDataResult, createErrorResult } from '~utils/result.js'



type RunGitOptions = {
  cwd?: string
}

async function runGit (
  args: Array<string>,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  const result = await execa('git', args, {
    ...(options?.cwd ? { cwd: options.cwd } : {}),
    reject: false,
  })

  if (result.failed) {
    const message = result.stderr.trim() || result.stdout.trim() || 'Git command failed'

    return createErrorResult(new Error(message))
  }

  return createDataResult(result.stdout.trim())
}

export async function isInsideGitRepository (
  options?: RunGitOptions,
): Promise<ResultType<boolean>> {
  const result = await runGit(['rev-parse', '--is-inside-work-tree'], options)

  if (result.error !== null) {
    return createErrorResult(result.error)
  }

  return createDataResult(result.data === 'true')
}

export async function getCurrentBranchName (
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['branch', '--show-current'], options)
}

export async function createBranch (
  branchName: string,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['checkout', '-b', branchName], options)
}

export async function fetchBranch (
  remoteName: string,
  branchName: string,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['fetch', remoteName, branchName], options)
}

export async function rebaseCurrentBranchOnto (
  targetBranch: string,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['rebase', targetBranch], options)
}

export async function stageAllTrackedFiles (
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['add', '-A'], options)
}

export async function commitWithMessage (
  header: string,
  body?: string,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  if (body?.trim()) {
    return runGit(['commit', '-m', header, '-m', body.trim()], options)
  }

  return runGit(['commit', '-m', header], options)
}

export async function hasPendingChanges (
  options?: RunGitOptions,
): Promise<ResultType<boolean>> {
  const result = await runGit(['status', '--porcelain'], options)

  if (result.error !== null) {
    return createErrorResult(result.error)
  }

  return createDataResult(result.data !== '')
}

export async function softResetTo (
  targetRevision: string,
  options?: RunGitOptions,
): Promise<ResultType<string>> {
  return runGit(['reset', '--soft', targetRevision], options)
}

export async function createTag (tag: string, message: string): Promise<ResultType<string>> {
  return runGit(['tag', '-a', tag, '-m', message])
}


export async function hasStagedChanges (
  options?: RunGitOptions,
): Promise<ResultType<boolean>> {
  const result = await execa('git', ['diff', '--cached', '--quiet'], {
    ...(options?.cwd ? { cwd: options.cwd } : {}),
    reject: false,
  })

  if (result.exitCode === 0) {
    return createDataResult(false)
  }

  if (result.exitCode === 1) {
    return createDataResult(true)
  }

  const message = result.stderr.trim() || result.stdout.trim() || 'Git command failed'

  return createErrorResult(new Error(message))
}

export async function renameCurrentBranch (newName: string): Promise<ResultType<string>> {
  return runGit(['branch', '-m', newName])
}


type GitCommitEntry = {
  hash: string
  shortHash: string
  subject: string
}

export async function getCommitsSince (
  targetBranch: string,
  options?: RunGitOptions,
): Promise<ResultType<Array<GitCommitEntry>>> {
  const result = await runGit([
    'log',
    '--reverse',
    '--pretty=format:%H\t%h\t%s',
    `${targetBranch}..HEAD`,
  ], options)

  if (result.error !== null || !result.data) {
    return createErrorResult(result.error ?? new Error('No commits found'))
  }

  const commits = result.data
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash = '', shortHash = '', subject = ''] = line.split('\t')

      return {
        hash,
        shortHash,
        subject,
      }
    })

  return createDataResult(commits)
}
