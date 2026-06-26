import { createHash } from 'crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'

const {version, description} = JSON.parse(readFileSync('./package.json', 'utf-8'))

const binaryFile = readdirSync('./binaries').find(file => file.includes(`v${version}`) && file.includes('macos-arm64'))

if (!binaryFile) {
  throw new Error(`No macOS arm64 binary found for version ${version} in ./binaries`)
}

const binaryPath = `./binaries/${binaryFile}`
const binaryBuffer = readFileSync(binaryPath)
const sha256 = createHash('sha256').update(binaryBuffer).digest('hex')

const formula = `class Gith < Formula
  desc "${description}"
  homepage "https://github.com/siwdie/gith"
  version "${version}"
  license "MIT"

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
writeFileSync('./Formula/gith.rb', formula)