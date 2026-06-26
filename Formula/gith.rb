class Gith < Formula
  desc "Configurable git workflow CLI with branch creation, rebase, commit, and squash helpers"
  homepage "https://github.com/siwdie/gith"
  version "1.6.0"
  license "MIT"

  on_arm do
    url "https://github.com/siwdie/gith/releases/download/v1.6.0/gith-v1.6.0-macos-arm64"
    sha256 "aa3c2301e16736114b2dd2e9926ad76d9527130c167d0d00c540f9015cf03b0d"
  end

  def install
    odie "gith is currently available only for Apple Silicon (arm64)." unless Hardware::CPU.arm?

    bin.install "gith-v1.6.0-macos-arm64" => "gith"
  end

  test do
    system "#{bin}/gith", "--version"
  end
end
