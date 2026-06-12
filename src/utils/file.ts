import { access } from 'node:fs/promises'



export async function fileExists (path: string): Promise<boolean> {
  return new Promise((resolve) => {
    access(path)
      .then(() => resolve(true))
      .catch(() => resolve(false))
  })
}
