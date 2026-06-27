import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=')
    return [key, rest.join('=')]
  }),
)

const { version, description } = JSON.parse(readFileSync('./package.json', 'utf-8'))

const macosArm64BinaryFile = args.macosArm64BinaryFile || process.env.MACOS_ARM64_BINARY_FILE
const macosArm64Sha256 = args.macosArm64Sha256 || process.env.MACOS_ARM64_SHA256
const linuxX64BinaryFile = args.linuxX64BinaryFile || process.env.LINUX_X64_BINARY_FILE
const linuxX64Sha256 = args.linuxX64Sha256 || process.env.LINUX_X64_SHA256
const outputPath = args.output || process.env.OUTPUT || './Formula/gith.rb'

if (!version) throw new Error('Missing version in package.json')
if (!description) throw new Error('Missing description in package.json')
if (!macosArm64BinaryFile) throw new Error('Missing macosArm64BinaryFile')
if (!macosArm64Sha256) throw new Error('Missing macosArm64Sha256')
if (!linuxX64BinaryFile) throw new Error('Missing linuxX64BinaryFile')
if (!linuxX64Sha256) throw new Error('Missing linuxX64Sha256')

const macosArm64Url = `https://github.com/siwdie/gith/releases/download/v${version}/${macosArm64BinaryFile}`
const linuxX64Url = `https://github.com/siwdie/gith/releases/download/v${version}/${linuxX64BinaryFile}`

const formula = `class Gith < Formula
  desc ${JSON.stringify(description)}
  homepage "https://github.com/siwdie/gith"
  version "${version}"
  license "MIT"

  on_macos do
    on_arm do
      url "${macosArm64Url}"
      sha256 "${macosArm64Sha256}"
    end
  end

  on_linux do
    url "${linuxX64Url}"
    sha256 "${linuxX64Sha256}"
  end

  def install
    if OS.mac?
      odie "gith is currently available only for Apple Silicon (arm64)." unless Hardware::CPU.arm?
      bin.install "${macosArm64BinaryFile}" => "gith"
    elsif OS.linux?
      odie "gith is currently available only for Linux x86_64." unless Hardware::CPU.is_64_bit?
      bin.install "${linuxX64BinaryFile}" => "gith"
    end
  end

  test do
    system "#{bin}/gith", "--version"
  end
end
`

mkdirSync(outputPath.replace(/\/[^/]+$/, ''), { recursive: true })
writeFileSync(outputPath, formula)