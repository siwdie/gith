import z from 'zod'

import { zBoolean, zNumberPositive, zString, zStringOptional } from '~/utils/zod.js'



export const githSelectOptionSchema = z.object({
  value: zString,
  label: zStringOptional,
  hint: zStringOptional,
})

export const githCommitHeaderSchema = z.object({
  minLength: zNumberPositive,
  maxLength: zNumberPositive,
})

export const githCommitBodySchema = z.object({
  enabled: zBoolean,
  maxLength: zNumberPositive,
})

export const githConfigSchema = z.object({
  defaultBranch: zString,
  branchTypes: z.array(githSelectOptionSchema),
  commitTypes: z.array(githSelectOptionSchema),
  commit: z.object({
    header: githCommitHeaderSchema,
    body: githCommitBodySchema,
  }),
})

export const githConfigPartialSchema = githConfigSchema.extend({
  defaultBranch: zString.optional(),
  branchTypes: z.array(githSelectOptionSchema).optional(),
  commitTypes: z.array(githSelectOptionSchema).optional(),
  commit: z.object({
    header: githCommitHeaderSchema.partial().optional(),
    body: githCommitBodySchema.partial().optional(),
  }).optional(),
})

export type GithSelectOption = z.infer<typeof githSelectOptionSchema>
export type GithCommitHeader = z.infer<typeof githCommitHeaderSchema>
export type GithConfig = z.infer<typeof githConfigSchema>
export type GithConfigPartial = z.infer<typeof githConfigPartialSchema>
