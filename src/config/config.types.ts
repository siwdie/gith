import z from 'zod'

import { zBooleanOrFalse, zNumberPositive, zString, zStringOptional } from '~/utils/zod.js'



export const githMonorepoSchema = z.object({ type: z.enum(['pnpm', 'yarn', 'cargo', 'maven', 'gradle']) })


export const githSelectOptionSchema = z.object({
  value: zString,
  label: zStringOptional,
  hint: zStringOptional,
})

export const githCommitHeaderSchema = z.object({
  minLength: zNumberPositive,
  maxLength: zNumberPositive,
})

export const githCommitBodySchema = z.union([
  z.literal(true),
  z.literal(false),
  z.object({
    maxLength: zNumberPositive,
    required: zBooleanOrFalse,
  }).partial(),
])

export const githScopeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    placeholder: zStringOptional,
    required: zBooleanOrFalse,
  }),
  z.object({
    type: z.literal('select'),
    options: z.array(githSelectOptionSchema),
    required: zBooleanOrFalse,
  }),
])

export const githConfigSchema = z.object({
  monorepo: githMonorepoSchema.optional(),
  defaultBranch: zString,
  branchTypes: z.array(githSelectOptionSchema),
  commitTypes: z.array(githSelectOptionSchema),
  scope: githScopeSchema.optional(),
  commit: z.object({
    header: githCommitHeaderSchema,
    body: githCommitBodySchema.optional(),
  }),
  release: z.object({
    hooks: z.object({
      beforeCommit: zStringOptional,
      afterCommit: zStringOptional,
    }).optional(),
  }).optional()
})

export const githConfigPartialSchema = githConfigSchema.extend({
  defaultBranch: zString.optional(),
  branchTypes: z.array(githSelectOptionSchema).optional(),
  commitTypes: z.array(githSelectOptionSchema).optional(),
  commit: z.object({
    header: githCommitHeaderSchema.partial().optional(),
    body: githCommitBodySchema.optional(),
  }).optional(),
})

export type GithMonorepoType = z.infer<typeof githMonorepoSchema>['type']

export type GithSelectOption = z.infer<typeof githSelectOptionSchema>
export type GithCommitHeader = z.infer<typeof githCommitHeaderSchema>
export type GithConfig = z.infer<typeof githConfigSchema>
export type GithConfigPartial = z.infer<typeof githConfigPartialSchema>
