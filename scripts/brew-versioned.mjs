import { createHash } from 'crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import process from 'node:process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const version = process.argv[2] ?? pkg.version

const [major, minor] = version.split('.')
if (!major || !minor) {
  throw new Error(`Invalid version: ${version}`)
}

const formulaName = `gith@${major}.${minor}`
const className = `GithAT${major}${minor}`

const binaryFile = readdirSync('./binaries').find(file =>
  file.includes(`v${version}`) && file.includes('macos-arm64')
)

if (!binaryFile) {
  throw new Error(`No macOS arm64 binary found for version ${version} in ./binaries`)
}

const binaryPath = `./binaries/${binaryFile}`
const binaryBuffer = readFileSync(binaryPath)
const sha256 = createHash('sha256').update(binaryBuffer).digest('hex')

const formula = `class ${className} < Formula
  desc "${pkg.description}"
  homepage "https://github.com/siwdie/gith"
  version "${version}"
  license "MIT"
  keg_only :versioned_formula

  on_arm do
    url "https://github.com/siwdie/gith/releases/download/v${version}/${binaryFile}"
    sha256 "${sha256}"
  end

  def install
    odie "gith is currently available only for Apple Silicon (arm64)." unless Hardware::CPU.arm?

    bin.install "${binaryFile}" => "gith"
  end

  test do
    system "#{bin}/gith", "--version"
  end
end
`

mkdirSync('./Formula', { recursive: true })
writeFileSync(`./Formula/${formulaName}.rb`, formula)