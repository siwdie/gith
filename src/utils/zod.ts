import z from 'zod'

import type { ZodError, ZodType } from 'zod'
import type { ResultType } from '~/utils/result.js'

import { createErrorResult, createDataResult } from '~/utils/result.js'



export const zString = z.string().trim().min(1)
export const zStringOptional = z.string().trim().transform(v => v.length > 0 ? v : undefined).optional()


export function safeParse<T> (schema: ZodType<T>, data: unknown): ResultType<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    return createErrorResult(new Error(formatZodError(result.error)))
  }

  return createDataResult(result.data)
}


export function formatZodError (error: ZodError): string {
  return error.issues
    .map(i => `${i.path.join('.')}: ${i.message}`)
    .join('\n')
}
