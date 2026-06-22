import type { ResultType } from '~/utils/result.js'

import { createDataResult, createErrorResult } from '~/utils/result.js'



export function parseToTypedJson<T> (text: string): ResultType<T> {
  if (!/^\s*(\{|\[)/.test(text)) {
    return createErrorResult(new Error('Content is not valid JSON (must start with { or [)'))
  }

  try {
    return createDataResult(JSON.parse(text) as T)
  } catch {
    return createErrorResult(new Error('Invalid JSON syntax'))
  }
}
