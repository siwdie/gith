import { readdirSync, renameSync } from 'fs'
import { readFileSync } from 'fs'
import { join, extname, basename } from 'path'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))
const binDir = './binaries'

for (const file of readdirSync(binDir)) {
  const ext = extname(file)
  const name = basename(file, ext)
  const newName = `${name}-v${version}${ext}`
  renameSync(join(binDir, file), join(binDir, newName))
}