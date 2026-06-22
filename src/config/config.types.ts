import z from 'zod'



export const githSelectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  hint: z.string().optional(),
})

export const githConfigSchema = z.object({
  defaultBranch: z.string(),
  branchTypes: z.array(githSelectOptionSchema),
  commitTypes: z.array(githSelectOptionSchema),
})

export const githConfigPartialSchema = githConfigSchema.partial()


export type GithSelectOption = z.infer<typeof githSelectOptionSchema>
export type GithConfig = z.infer<typeof githConfigSchema>
