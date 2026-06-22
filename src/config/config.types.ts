import z from 'zod'

import { zString, zStringOptional } from '~/utils/zod.js'



export const githSelectOptionSchema = z.object({
  value: zString,
  label: zString,
  hint: zStringOptional,
})

export const githConfigSchema = z.object({
  defaultBranch: zString,
  branchTypes: z.array(githSelectOptionSchema),
  commitTypes: z.array(githSelectOptionSchema),
})

export const githConfigPartialSchema = githConfigSchema.partial()


export type GithSelectOption = z.infer<typeof githSelectOptionSchema>
export type GithConfig = z.infer<typeof githConfigSchema>
